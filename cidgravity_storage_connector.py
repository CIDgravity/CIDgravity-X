#!/usr/bin/python3
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
# modifier le readme
# coder le check : Checking Script version")

################################################################################
# DEFAULT VALUES
################################################################################
# DEFAULT COFNIG LOCATION
DEFAULT_CONFIG_FILE = os.path.dirname(os.path.realpath(__file__)) + "/config.toml"

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



class ConfigFileException(Exception):
    """ ConfigFile Exception Class """
    decision_value = None
    message = None
    def __init__(self, value, internal_message):
        self.decision_value = value
        self.message = "Failed to load Config file : " + internal_message
        super().__init__(self.message)



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
        raise ConfigFileException(default_behavior, f'log_file access error : {exception}')

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
        import requests
        response = requests.post(CONFIG["api"]["endpoint"], json=deal_proposal, headers=headers)
        if CONFIG["logging"]["debug"]:
            log(json.dumps(deal_proposal, indent=4, sort_keys=True), "CLIENT_REQ", "DEBUG")
    except requests.exceptions.RequestException  as exception:
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
    all_good = True

    # CHECK CONFIG FILE
    ###
    print('{0:<30} '.format("CIDgravity Config File"), end="")
    try:
        load_config_file(ARGS.c, True)
    except ConfigFileException as exception:
        sys.exit("[Failed ] " + exception.message)
    else:
        print("[Success]")

    # VERIFY API CONNECTIVITY TO CID gravity
    ###
    import requests

    print('{0:<30} '.format("CIDgravity API connectivity"), end="")
    headers = {
        'Authorization': 'Bearer ' + CONFIG["api"]["token"],
        'X-CIDgravity-Agent': 'CIDgravity-storage-Connector',
        'X-CIDgravity-Version': VERSION
    }
    try:
        response = requests.post(CONFIG["api"]["endpoint"] + "/ping", data=None, headers=headers)
    except requests.exceptions.RequestException  as exception:
        sys.exit(f'[Failed ] API error : { exception }')

    if (response.status_code == 200):
        print(f"[Success] {response.content.decode('utf-8')}")

    # VERIFY EXECUTED WITH LOTUS MINER
    ###
    print('{0:<30} '.format("Lotus-miner environment"), end="")
    miner_path = os.environ['LOTUS_MINER_PATH'] if 'LOTUS_MINER_PATH' in os.environ.keys() else os.environ['HOME'] + "/.lotusminer"
    miner_config_file = miner_path + "/config.toml"
    try:
        open(miner_config_file, 'r').close()
    except Exception as exception:
        sys.exit(f"[Failed ] {exception} ")
    try:
        import toml
        miner_config = toml.load(miner_config_file)
    except Exception as exception:
        sys.exit(f'[Failed ] Cannot load { miner_config_file } : { exception }')
    else:
        print("[Success]")

    print('{0:<30} '.format("Lotus-miner get-ask"), end="")
    # GET API
    with open(miner_path + "/api", "r") as text_file:
        miner_api_line = text_file.read()
    miner_api = miner_api_line.split("/")
    miner_api_ip = miner_api[2]
    miner_api_port = miner_api[4]
    miner_url = "http://" + miner_api_ip + ":" + miner_api_port + "/rpc/v0"

    # GET MARKETASK
    jsondata = json.dumps({"jsonrpc": "2.0", "method": "Filecoin.MarketGetAsk", "params": [], "id": 3})
    try:
        miner_get_ask = json.loads(requests.post(miner_url, data=jsondata).content)["result"]["Ask"]
    except requests.exceptions.RequestException  as exception:
        sys.exit(f'[Failed ] API error : { exception }')

    # GET SECTORSIZE
    jsondata = json.dumps({"jsonrpc": "2.0", "method": "Filecoin.ActorSectorSize", "params": [miner_get_ask["Miner"]], "id": 3})
    try:
        miner_sector_size = json.loads(requests.post(miner_url, data=jsondata).content)["result"]
    except requests.exceptions.RequestException  as exception:
        sys.exit(f'[Failed ] API error : { exception }')

    # VERIFY GET ASK
    if miner_get_ask['Price'] != "0" or miner_get_ask['VerifiedPrice'] != "0" or miner_get_ask['MinPieceSize'] != 256 or miner_get_ask['MaxPieceSize'] != miner_sector_size:
        print(f'[Warning] its highly recommended to set your prices to 0 and your accepting size to min=256B and max={miner_sector_size} by executing : ')
        print(f'\n\tlotus-miner storage-deals set-ask --price 0 --verified-price 0 --min-piece-size 256 --max-piece-size {miner_sector_size}\n')
        all_good = False
    else:
        print("[Success]")

    # VERIFY DEAL FILTER IS CONFIGURED IN CONFIG.TOML
    ###
    print('{0:<30} '.format("Filter configuration"), end="")
    try:
        filter_storage = miner_config["Dealmaking"]["Filter"]
    except Exception as exception:
        print(f'[Failed ] Filter not set in config.toml. Add one of the following lines in [Dealmaking] section :')
        print(f'\n\tFilter = "{os.path.realpath(__file__)} --accept" ')
        print("OR")
        print(f'\tFilter = "{os.path.realpath(__file__)} --reject" ')
        sys.exit()

    import re
    if re.match(f'^{os.path.realpath(__file__)}[ ]*--(accept|reject)[ ]*$', filter_storage):
        print("[Success]")
    else:
        print(f'[Failed ] "Filter" found in [Dealmaking] section of config.toml. But does not match one of the following values:')
        print(f'\n\tCurrent : \tFilter = "{filter_storage}"')
        print(f'\tShould be :')
        print(f'\t\t\tFilter = "{os.path.realpath(__file__)} --accept" ')
        print(f'\t\tOR\tFilter = "{os.path.realpath(__file__)} --reject" ')
        sys.exit()

    print('''
 _________________________________________________
/ All set! the connector is properly configured.  \\
\ Don't forget to restart the miner               /
 -------------------------------------------------
        \   ^__^
         \  (oo)\_______
            (__)\       )\/\\
                ||----w |
                ||     ||
''') if all_good else ""
    sys.exit(0)

def printj(parsed):
    """JSON PRETTY PRINT"""
    print(json.dumps(parsed, indent=4, sort_keys=True))

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

    # DEFINE DEFAULT BEHAVIOR IN CASE ERRORS OCCURED
    DEFAULT_BEHAVIOR = "reject" if ARGS.reject else "accept"

    # LOAD CONFIG FILE
    try:
        load_config_file(ARGS.c, DEFAULT_BEHAVIOR)
    except ConfigFileException as exception:
        decision(exception.decision_value, exception.message)

    run()
