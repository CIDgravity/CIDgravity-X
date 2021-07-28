#!/usr/bin/python3
# pylint: disable=C0301, E0213, W0621, W0404, C0415, W0611, W0703, W0702, R0914, R0912, R0915
"""
@author: CID gravity
Copyright (c) 2021 CID gravity

MIT License

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
"""

import json
import sys
import os.path
import argparse
import datetime

VERSION = "1.0"

# XXX TODO
# coder le check : Checking Script version")

################################################################################
# DEFAULT VALUES
################################################################################
# DEFAULT COFNIG LOCATION
DEFAULT_CONFIG_FILE = os.path.dirname(os.path.realpath(__file__)) + "/cidgravity_storage_connector.toml"

# MANDATORY FIELDS IN CONFIG FILE
CONFIG = {
    'api': {
        'endpoint': 'https://api.cidgravity.com/api/proposal/check',
        'token': ''
    },
    'logging': {
        'log_file': '/var/log/lotus/cidgravity_storage_connector.log',
        'debug': False
    }
}

class Result:
    """ a very simple class to display and format the --check results """
    UNDERLINE = '\033[04m'
    BLINK = '\033[05m'
    GREY = '\033[90m'
    RED = '\033[31m'
    GREEN = '\033[32m'
    BLUE = '\033[34m'
    MAGENTA = '\033[35m'
    ENDC = '\033[0m'

    NUMBER_OF_STEPS = 6
    STEP = 1

    def success(string=""):
        """ display a sucess tag"""
        print(f"[{Result.GREEN}Success{Result.ENDC}] {string}")

    def exit_failed(err_msg, hint=None, command=None):
        """ display a failed tag with the associated message, hint and command before exiting"""
        Result.failed(err_msg)
        if hint:
            print(f"\n{Result.UNDERLINE}HINT :{Result.ENDC} {hint}", end="")
        if command:
            print(" :")
            Result.command(f"\n{command}\n")
        else:
            print("\n")
        sys.exit()

    def failed(string):
        """ display a failed tag """
        print(f"[{Result.RED}Failed {Result.ENDC}] {string}")

    def command(command):
        """ display a command"""
        print(f"\t\t{Result.BLUE}{command}{Result.ENDC}")

    def label(string):
        """ display a label"""
        print(f'{Result.GREY}{Result.STEP}/{Result.NUMBER_OF_STEPS} - {Result.ENDC}' + '{0:<30} '.format(string), end="")
        Result.STEP += 1

    def allgood():
        """ display the final message before exiting """
        print(Result.MAGENTA + '''
 _________________________________________________
/ All set! the connector is properly configured.  \\
\ Don't forget to restart the miner               /
 -------------------------------------------------
        \   ^__^
         \  (\033[05moo\033[0m\033[35m)\_______
            (__)\       )\/\\
                ||----w |
                ||     ||
''' + Result.ENDC)


class ConfigFileException(Exception):
    """ ConfigFile Exception Class """
    decision_value = None
    message = None
    def __init__(self, value, internal_message):
        self.decision_value = value
        self.message = "Failed to load Config file : " + internal_message
        super().__init__(self.message)

class LogFileException(ConfigFileException):
    pass

def log(msg, code="", level="INFO"):
    """ logging decision and debug to a local file """
    try:
        with open(CONFIG["logging"]["log_file"], 'a') as logfile:
            output_date = datetime.datetime.now().strftime("%Y-%m-%dT%H:%M:%S")
            print('{0:<20} {1:<6} {2:<12} {3:>}'.format(output_date, level, code, msg), file=logfile)
    except:
        print("ERROR Internal : run --check")



def load_config_file(abs_path, default_behavior):
    """ LOAD CONFIGURATION FILE """
    if not os.path.isfile("/" + abs_path):
        raise ConfigFileException(default_behavior, abs_path + " is not accessible or an absolute path")

    try:
        # Module is imported here for being able to return default behavior on error
        import toml
        new_config = toml.load(abs_path)
    except Exception as exception:
        raise ConfigFileException(default_behavior, f'Cannot load { abs_path } : { exception }')

    # VERIFY THAT ALL TOML MANDATORY FILEDS EXIST
    for section_name, section in  CONFIG.items():
        for variable_name, value in section.items():
            try:
                new_value = new_config[section_name][variable_name]
            except Exception as exception:
                if value == '':
                    raise ConfigFileException(default_behavior, "[" + section_name + "][" + variable_name + "] missing in config file")
            else:
                CONFIG[section_name][variable_name] = new_value

    # VERIFY IF LOG_FILE IS WRITABLE
    try:
        open(CONFIG["logging"]["log_file"], 'a').close()
    except Exception as exception:
        raise LogFileException(default_behavior, f'log_file access error : {exception}')

    # VERIFY IF DEBUG VALUE IS A BOOLEAN
    if not isinstance(CONFIG["logging"]["debug"], bool):
        raise ConfigFileException(default_behavior, f"[logging][debug] is not a boolean : {type(CONFIG['logging']['debug'])}")



def decision(value, internal_message, external_message=""):
    """ terminate script execution by printing messages and exiting with the appropriate code """
    exit_value = 0 if value == "accept" else 1
    decision_msg = f'Deal {value}ed{(" | " + external_message) if external_message != "" else ""}'

    # LOG DECISION AND REASON
    log(internal_message, value)

    # EXTERNAL MESSAGE AND DECISION
    print(decision_msg)
    sys.exit(exit_value)



def run():
    """ check deal acceptance against api each time lotus
    calls the script and provide the proposal json on stdin"""

    # GET STDIN JSON PROPOSAL
    try:
        deal_proposal = json.load(sys.stdin)
    except json.decoder.JSONDecodeError as exception:
        decision(DEFAULT_BEHAVIOR, f"JSON unable to parse the DealProposal : {exception}")

    # SET HEADERS
    headers = {
        'Authorization': 'Bearer ' + CONFIG["api"]["token"],
        'X-CIDgravity-Agent': 'CIDgravity-storage-Connector',
        'X-CIDgravity-Version': VERSION
    }

    # CALL API
    try:
        # Module is imported here to be able to return default behavior
        import requests
        response = requests.post(CONFIG["api"]["endpoint"], json=deal_proposal, headers=headers)
        if CONFIG["logging"]["debug"]:
            log(json.dumps(deal_proposal, indent=4, sort_keys=True), "CLIENT_REQ", "DEBUG")
    except Exception as exception:
        decision(DEFAULT_BEHAVIOR, f"API error : { exception }")

    # MANAGE HTTP ERROR
    if response.status_code != 200:
        if CONFIG["logging"]["debug"]:
            log(json.dumps(dict(response.headers), indent=4, sort_keys=True) + "\n" + str(response.content), "API_RESPONSE", "DEBUG")
        decision(DEFAULT_BEHAVIOR, f"API error : { response.status_code } - { response.reason }")

    # READ API RESPONSE
    try:
        api_result = response.json()
        if CONFIG["logging"]["debug"]:
            log(json.dumps(api_result, indent=4, sort_keys=True), "API_RESPONSE", "DEBUG")
    except json.decoder.JSONDecodeError as exception:
        decision(DEFAULT_BEHAVIOR, f"API unable to parse JSON { exception }")

    # APPLY DECISION
    decision_value = DEFAULT_BEHAVIOR if api_result["decision"] == "error" else api_result["decision"]
    decision(decision_value, api_result['internalMessage'], api_result['externalMessage'])



def check():
    """ CHECK PROCESS EXECUTED WHEN USING --check """
    print(f"""
This will guide you and check the {Result.NUMBER_OF_STEPS} remaining small steps to get "CIDgravity connector" fully deployed and functionnal
IN CASE OF FAILURE MAKE CORRECTION AND RE-RUN THIS COMMAND UNTIL ITS SUCCESSFUL
""")

    # verify required modules are installed
    ###
    Result.label(f"Required python3 modules")
    try:
        import json
        import sys
        import os.path
        import argparse
        import datetime
        import requests
        import toml
    except Exception as exception:
        Result.exit_failed(f"loading python3 modules : {exception}", "install the missing packages", 'sudo apt install python3-requests python3-toml')
    else:
        Result.success()

    # CHECK CONFIG FILE
    ###
    Result.label("CIDgravity config File")
    try:
        load_config_file(ARGS.c, True)
    except LogFileException as exception:
        Result.exit_failed(exception.message, "review logfile access permissions or configure another logfile path in cidgravity_storage_connector.toml")
    except ConfigFileException as exception:
        Result.exit_failed(exception.message, "create a configfile directly from the template and add your token inside", f"cp {ARGS.c}.sample {ARGS.c}")
    else:
        Result.success()

    # VERIFY API CONNECTIVITY TO CID gravity
    ###

    Result.label("CIDgravity API connectivity")
    headers = {
        'Authorization': 'Bearer ' + CONFIG["api"]["token"],
        'X-CIDgravity-Agent': 'CIDgravity-storage-Connector',
        'X-CIDgravity-Version': VERSION
    }
    try:
        response = requests.post(CONFIG["api"]["endpoint"] + "/ping", data=None, headers=headers)
    except requests.exceptions.RequestException  as exception:
        Result.exit_failed(f'API error : { exception }', "", "")

    if response.status_code == 200:
        Result.success({response.content.decode('utf-8')})
    elif response.status_code == 401:
        Result.exit_failed(f'Connection to {CONFIG["api"]["endpoint"] + "/ping"} : {response.status_code} - {response.reason}', "edit your config file and add the CID gravity token inside. You find the CIDgravity token under Profile section on the CIDgravity portal", f"nano { ARGS.c }")
    else:
        Result.exit_failed(f'Connection to {CONFIG["api"]["endpoint"] + "/ping"} : {response.status_code} - {response.reason}', "connectivity issue with the CIDgravity cloud platform.")

    # VERIFY EXECUTED WITH LOTUS MINER
    ###
    Result.label("Lotus-miner environment")
    miner_path = os.environ['LOTUS_MINER_PATH'] if 'LOTUS_MINER_PATH' in os.environ.keys() else os.environ['HOME'] + "/.lotusminer"
    miner_config_file = miner_path + "/config.toml"
    try:
        open(miner_config_file, 'r').close()
    except Exception as exception:
        Result.exit_failed(f'Cannot load { miner_config_file } : { exception }', "ensure you are running this command from the same user as lotus-miner. If you use another location than ~/.lotusminer ensure that LOTUS_MINER_PATH is set before running this command", 'id\nexport "LOTUS_MINER_PATH=XXX"')
    try:
        miner_config = toml.load(miner_config_file)
    except Exception as exception:
        Result.exit_failed(f'Cannot load { miner_config_file } : { exception }', "verify the lotus-miner configuration file is in a proper toml format", f"nano {miner_config_file}")
    else:
        Result.success()

    Result.label("Lotus-miner get-ask")
    # GET API URL
    with open(miner_path + "/api", "r") as text_file:
        miner_api_line = text_file.read()
    miner_api = miner_api_line.split("/")
    miner_url = "http://" + miner_api[2] + ":" + miner_api[4] + "/rpc/v0"

    # GET MARKETASK
    jsondata = json.dumps({"jsonrpc": "2.0", "method": "Filecoin.MarketGetAsk", "params": [], "id": 3})
    try:
        miner_get_ask = json.loads(requests.post(miner_url, data=jsondata).content)["result"]["Ask"]
    except Exception as exception:
        Result.exit_failed(f'API error : { exception }', "verify the miner API are accessible on the local machine", "curl -v -X PST --data '{ \"method\": \"Filecoin.MarketGetAsk\", \"id\": 3 }' http://127.0.0.1:2345/rpc/v0")

    # GET SECTORSIZE
    jsondata = json.dumps({"jsonrpc": "2.0", "method": "Filecoin.ActorSectorSize", "params": [miner_get_ask["Miner"]], "id": 3})
    try:
        miner_sector_size = json.loads(requests.post(miner_url, data=jsondata).content)["result"]
    except Exception as exception:
        Result.exit_failed(f'API error : { exception }', "verify the miner API are accessible on the local machine", "curl -v -X PST --data '{ \"method\": \"Filecoin.ActorSectorSize\", \"id\": 3 }' http://127.0.0.1:2345/rpc/v0")

    # VERIFY GET ASK
    if miner_get_ask['Price'] != "0" or miner_get_ask['VerifiedPrice'] != "0" or miner_get_ask['MinPieceSize'] != 256 or miner_get_ask['MaxPieceSize'] != miner_sector_size:
        Result.exit_failed(f'GET-ASK price has to be set to 0 and your accepting size to min=256B and max={miner_sector_size}', "set the prices and sizes by typing", f'lotus-miner storage-deals set-ask --price 0 --verified-price 0 --min-piece-size 256 --max-piece-size {miner_sector_size}')
    else:
        Result.success()

    # VERIFY DEAL FILTER IS CONFIGURED IN config.toml
    ###
    Result.label("Filter activated on miner")
    config_option = "" if ARGS.c == DEFAULT_CONFIG_FILE else f"-c {ARGS.c} "
    try:
        filter_storage = miner_config["Dealmaking"]["Filter"]
    except Exception as exception:
        Result.exit_failed(f'Filter not set in  {miner_config_file}', 'Add the following line to the [Dealmaking] section.', f'Filter = "{os.path.realpath(__file__)} {config_option}--accept"')
    else:
        import re
        if re.match(f'^{os.path.realpath(__file__)}[ ]*--(accept|reject)[ ]*$', filter_storage):
            Result.success()
        else:
            Result.exit_failed(f'"Filter" found in [Dealmaking] section of {miner_config_file}, but doesn\'t match standard lines', 'Add the following line to the [Dealmaking] section.', f'Filter = "{os.path.realpath(__file__)} {config_option}--accept"')

    Result.allgood()

if __name__ == "__main__":
    # SET COMMANDLINES ARGUMENTS
    PARSER = argparse.ArgumentParser(description="CID gravity storage connector")
    GROUP = PARSER.add_mutually_exclusive_group(required=True)
    PARSER.add_argument("-c",
                        help="config file absolute path (default : " + DEFAULT_CONFIG_FILE + ")",
                        default=DEFAULT_CONFIG_FILE, metavar="PATH")
    GROUP.add_argument("--version", action='version', version=VERSION)
    GROUP.add_argument("--check", help="check connector environment", action="store_true")
    GROUP.add_argument("--reject", help="reject all incoming deals if an error occurs", action="store_true")
    GROUP.add_argument("--accept", help="accept all incoming deals if an error occurs", action="store_true")
    ARGS = PARSER.parse_args()

    if ARGS.check:
        check()
        sys.exit(0)

    # DEFINE DEFAULT BEHAVIOR IN CASE ERRORS OCCURED
    DEFAULT_BEHAVIOR = "reject" if ARGS.reject else "accept"

    # LOAD CONFIG FILE
    try:
        load_config_file(ARGS.c, DEFAULT_BEHAVIOR)
    except ConfigFileException as exception:
        decision(exception.decision_value, exception.message)

    run()
