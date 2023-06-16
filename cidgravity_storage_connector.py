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

VERSION = "2.2"

################################################################################
# DEFAULT VALUES
################################################################################
# API TIMEOUT IN SEC
TIMEOUT_CONNECT = 2
TIMEOUT_READ = 5

# DEFAULT CONFIG LOCATION
DEFAULT_CONFIG_FILE = os.path.dirname(os.path.realpath(__file__)) + "/cidgravity_storage_connector.toml"
DEFAULT_LOG_FILE = os.path.dirname(os.path.realpath(__file__)) + "/cidgravity_storage_connector.log"

# MANDATORY FIELDS IN CONFIG FILE
CONFIG = {
    'api': {
        'token': '',
        'tokenList': [],
        'endpoint_proposal_check': 'https://api.cidgravity.com',
        'endpoint_miner_status_check': 'https://service.cidgravity.com'
    },
    'logging': {
        'log_file': DEFAULT_LOG_FILE,
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

    NUMBER_OF_STEPS = 7
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
        print(f"[{Result.RED}Failed{Result.ENDC}] {string}")

    def command(command):
        """ display a command"""
        print(f"\t\t{Result.BLUE}{command}{Result.ENDC}")

    def label(string):
        """ display a label"""
        print(f'{Result.GREY}{Result.STEP}/{Result.NUMBER_OF_STEPS} - {Result.ENDC}' + '{0:<35} '.format(string),
              end="")
        Result.STEP += 1

    def allgood():
        """ display the final message before exiting """
        print(Result.MAGENTA + '''
 _________________________________________________
/ All set! the connector is properly configured.  \\
\          Don't forget to restart boost          /
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
    """ Custom Logger Exception Class """


def log(msg, code="", level="INFO"):
    """ logging decision and debug to a local file """
    try:
        with open(CONFIG["logging"]["log_file"], 'a') as logfile:
            output_date = datetime.datetime.now().strftime("%Y-%m-%dT%H:%M:%S")
            print('{0:<20} {1:<6} {2:<12} {3:>}'.format(output_date, level, code, msg), file=logfile)
    except:
        pass


def load_config_file(abs_path, default_behavior):
    """ LOAD CONFIGURATION FILE """
    if not os.path.isfile("/" + abs_path):
        raise ConfigFileException(default_behavior, abs_path + " is not accessible or an absolute path")

    try:
        # Module is imported here for being able to return default behavior on error
        import toml
        new_config = toml.load(abs_path)
    except Exception as exception:
        raise ConfigFileException(default_behavior, f'Cannot load {abs_path} : {exception}')

    # VERIFY THAT ALL TOML MANDATORY FIELDS EXIST
    for section_name, section in CONFIG.items():
        for variable_name, value in section.items():
            try:
                new_value = new_config[section_name][variable_name]
            except Exception as exception:
                # If API/token or API/tokenList is set that's fine we can proceed
                if section_name == "api" and variable_name == "token":
                    if "api" in new_config and "tokenList" in new_config["api"]:
                        continue
                elif section_name == "api" and variable_name == "tokenList":
                    if "api" in new_config and "token" in new_config["api"]:
                        continue

                # If a param is empty in the default configuration it's mandatory so lets rise an error
                if value in ('', []):
                    raise ConfigFileException(default_behavior,
                                              "[" + section_name + "][" + variable_name + "] missing in config file")
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
    if external_message != "":
        external_message = f' | {external_message}'

    decision_msg = f'Deal {value}ed{external_message}'

    # LOG DECISION AND REASON
    log(internal_message, value)

    # EXTERNAL MESSAGE AND DECISION
    print(decision_msg, end="")
    sys.exit(exit_value)


def run():
    """ check deal acceptance against api each time a proposal is received
    calls the script and provide the proposal json on stdin"""

    # GET STDIN JSON PROPOSAL
    try:
        deal_proposal = json.load(sys.stdin)
    except Exception as exception:
        decision(DEFAULT_BEHAVIOR, f"Error : Connector unable to parse the deal proposal : {exception}", "Error")

    if CONFIG["logging"]["debug"]:
        log(json.dumps(deal_proposal, indent=4, sort_keys=True), "CLIENT_REQ", "DEBUG")

    # EXTRACT Dealtype : storage/retrieval/empty
    if deal_proposal['DealType']:
        dealtype = deal_proposal['DealType']
    else:
        dealtype = ""
        log("Unable to identify deal type", "PARSE PROPOSAL", "WARNING")


    # EXTRACT providerID from proposal
    if dealtype == "storage":
        try:
            # provider location for legacy deals
            provider = deal_proposal['Proposal']['Provider']
        except Exception as exception:
            try:
                # format_version = v2.0.0 / 2.1.0 or 2.2.0
                provider = deal_proposal['ClientDealProposal']['Proposal']['Provider']
            except:
                decision(DEFAULT_BEHAVIOR, f"Error  : cannot find provider in the proposal / unsupported storage proposal format", "Error")
    else:
        # No provider fields in retrieval proposals
        provider = ""


    # SELECT THE ENDPOINT ACCORDING TO LABEL VALUE
    # EXTRACT Proposal.Label field, if not found consider an empty label (this is good enough to consider it as a proposal and not a miner status check)
    # Extract from legacy format
    if dealtype == "storage":
        # Extract from boost 2.X format
        try:
            label = deal_proposal['ClientDealProposal']['Proposal']['Label']
        except Exception as exception:
            try:
                # Extract for Label in legacy format
                label = deal_proposal['Proposal']['Label']
            except Exception as exception:
                log("Unable to find /Proposal/Label value", "PARSE PROPOSAL", level="WARNING")
                label = ""
    else:
        label = ""

    # DEFAULT VALUE OR CONFIG.TOML VALUE IS SET DURING THE LOAD_CONFIG_FILE FUNCTION
    if label.startswith('cidg-miner-status-check'):
        endpoint = CONFIG["api"]["endpoint_miner_status_check"] + "/api/v1/miner-status/check"
    else:
        endpoint = CONFIG["api"]["endpoint_proposal_check"] + "/api/proposal/check"


    # Set token based on API/token and API/tokenList
    token = CONFIG["api"]["token"]
    if len(token) == 0:
        if len(CONFIG["api"]["tokenList"]) < 1:
            decision(DEFAULT_BEHAVIOR, f"Error  : No token found in the config file", "Error")
        else:
            token = get_valid_token_for_provider(provider)
            if token is None:
                decision(DEFAULT_BEHAVIOR, f"Error  : no token found for provider {provider}", "Error")
    else:
        # Try to find the provider in the token in case of retrieval (does not work on venus)
        if provider == "" and token.startswith("f0") and "-" in token:
            provider = token.split("-", 1)[0]

    # SET HEADERS
    headers = {
        'Authorization': token,   # Back
        'X-API-KEY': token,       # Kong
        'X-Address-ID': provider, # Kong (empty for venus on retrieval)
        'X-CIDgravity-Agent': 'CIDgravity-storage-Connector',
        'X-CIDgravity-Version': VERSION,
        'X-CIDgravity-DefaultBehavior': DEFAULT_BEHAVIOR
    }

    # CALL API
    try:
        # Module is imported here to be able to return default behavior
        import requests
        response = requests.post(endpoint, json=deal_proposal, headers=headers, timeout=(TIMEOUT_CONNECT, TIMEOUT_READ))
    except Exception as exception:
        decision(DEFAULT_BEHAVIOR, f"Error  : connecting API failed : {exception}", "Error")

    # MANAGE HTTP ERROR
    if response.status_code != 200:
        if CONFIG["logging"]["debug"]:
            log(json.dumps(dict(response.headers), indent=4, sort_keys=True) + "\n" + str(response.content),
                "API_RESPONSE", "DEBUG")
        if DEFAULT_BEHAVIOR == "accept":
            decision(DEFAULT_BEHAVIOR, f"Error : API code : {response.status_code} - {response.reason}", "")
        else:
            decision(DEFAULT_BEHAVIOR, f"Error : API code : {response.status_code} - {response.reason}", "Error")

    # READ API RESPONSE
    try:
        api_result = response.json()
    except Exception as exception:
        decision(DEFAULT_BEHAVIOR, f"Error : unable to parse API response : {exception} {response.content}", "Error")
    if CONFIG["logging"]["debug"]:
        log(json.dumps(api_result, indent=4, sort_keys=True), "API_RESPONSE", "DEBUG")

    # Extract API RESPONSE VALUE
    try:
        decision_value = DEFAULT_BEHAVIOR if api_result["decision"] == "error" else api_result["decision"]
    except Exception as exception:
        decision(DEFAULT_BEHAVIOR, f"Error : decision not found in API response : { exception } { response.content }", "Error")

    # APPLY DECISION
    full_external_message = (api_result['externalMessage']) if api_result["externalMessage"] != "" else ""
    if api_result['customMessage'] != "" and full_external_message != "":
        full_external_message += " | "
    full_external_message += api_result['customMessage']

    decision(decision_value, api_result['internalMessage'], full_external_message)


def common_check():
    ''' Verify that required modules are installed'''
    Result.label(f"Required python3 modules")

    try:
        import json
        import sys
        import os.path
        import argparse
        import datetime
        import requests
        import toml
        import re
    except Exception as exception:
        Result.exit_failed(f"loading python3 modules : {exception}", "install the missing packages",
                           'sudo apt install python3-requests python3-toml python3-regex')
    else:
        Result.success()

    # Check the config file
    Result.label("CIDgravity config File")

    try:
        load_config_file(ARGS.c, True)
    except LogFileException as exception:
        Result.exit_failed(exception.message,
                           "review logfile access permissions or configure another logfile path in "
                           "cidgravity_storage_connector.toml")
    except ConfigFileException as exception:
        Result.exit_failed(exception.message,
                           "create a configfile directly from the template and add your token inside",
                           f"cp {ARGS.c}.sample {ARGS.c}")
    else:
        Result.success()


def api_connectivity_check(token_id, token):
    ''' Check API connectivity '''
    import requests

    if token_id != -1:
        Result.label(f'CIDg API connectivity for token {token_id}')
    else:
        Result.label('CIDg API connectivity')

    headers = {
        'Authorization': token,
        'X-CIDgravity-Agent': 'CIDgravity-storage-Connector',
        'X-CIDgravity-Version': VERSION,
    }
    try:
        response = requests.post(CONFIG["api"]["endpoint_proposal_check"] + "/api/proposal/check/ping", data=None, headers=headers,
                                 timeout=(TIMEOUT_CONNECT, TIMEOUT_READ))
    except requests.exceptions.RequestException as exception:
        Result.exit_failed(f'API error : {exception}', "", "")

    if response.status_code == 200:
        Result.success({response.content.decode('utf-8')})
    elif response.status_code == 401:
        Result.exit_failed(
            f'Connection to {CONFIG["api"]["endpoint_proposal_check"] + "/api/proposal/check/ping"} : {response.status_code} - {response.reason}',
            "edit your config file and add the CID gravity token inside. You find the CIDgravity token under [Settings]/OtherSettings on the CIDgravity app",
            f"nano {ARGS.c}")
    else:
        Result.exit_failed(
            f'Connection to {CONFIG["api"]["endpoint_proposal_check"] + "/api/proposal/check/ping"} : {response.status_code} - {response.reason}',
            "connectivity issue with the CIDgravity cloud platform.")


def get_valid_token_for_provider(provider):
    ''' return for the token associated to the provider '''
    import re

    # SEARCH FOR VALID TOKEN FOR PROVIDER
    for token in CONFIG["api"]["tokenList"]:
        try:
            match = re.search('^[^-]*', token)

            if match:
                if match.group(0) == provider:
                    return token
        except AttributeError:
            pass

    # IF NOT FOUND, RETURN NONE, WE WILL HANDLE AN ERROR
    return None


def check_venus():
    ''' run check specific to venus '''
    Result.NUMBER_OF_STEPS = 3
    common_check()

    if len(CONFIG["api"]["token"]) > 0:
        Result.label('CIDgravity API connectivity')
        Result.exit_failed("[api][token] set, for VENUS only set [api][tokenList] and comment out [api][token]. Edit your config file ")

    if len(CONFIG["api"]['tokenList']) > 0:
        for token_id, token in enumerate(CONFIG["api"]["tokenList"]):
            api_connectivity_check(token_id, token)
    else:
        Result.label('CIDgravity API connectivity')
        Result.exit_failed("There is no valid token provided in 'tokenList'. Edit your config file ")

    Result.allgood()

def check_boost():
    ''' run check specific to boost '''
    common_check()

    if len(CONFIG["api"]["token"]) == 0:
        Result.label('CIDgravity API connectivity')
        Result.exit_failed("[api][token] not set. Edit your config file ")

    api_connectivity_check(-1, CONFIG["api"]["token"])

    # VERIFY IF LOTUS-MARKETS VARIABLE EXIST
    node_type = "Unknown"
    Result.label("Node type identification")
    if 'LOTUS_MARKETS_PATH' in os.environ.keys():
        config_path = os.environ['LOTUS_MARKETS_PATH']
        if os.path.exists(config_path + "/boost.db"):
            node_type = "boost"
        else:
            Result.exit_failed(f'LOTUS_MARKETS_PATH exists but not set to boost homedir', "when LOTUS_MARKETS_PATH is set, it should point to boost home dir", 'id\nexport "LOTUS_MARKETS_PATH=THIS_NODE_BOOST_HOME_DIR"')

    elif os.path.exists(os.environ['HOME'] + "/.boost/boost.db"):
        config_path = os.environ['HOME'] + "/.boost"
        node_type = "boost"
    else:
        Result.exit_failed(f'Cannot identify node type', "ensure this command run under the same user as boost. If you use another location than ~/.boost ensure that LOTUS_MARKETS_PATH is properly set prior running this command", 'id\nexport "LOTUS_MARKETS_PATH=XXX"')

    # Check config file exist
    config_file = config_path + "/config.toml"
    try:
        open(config_file, 'r').close()
    except Exception as exception:
        Result.exit_failed(f'Cannot load { config_file } : { exception }', "ensure this command run under the same user as boost. If you use another location than ~/.boost ensure that LOTUS_MARKETS_PATH is properly set prior running this command", 'id\nexport "LOTUS_MARKETS_PATH=XXX"')

    # Requirements checks passed, import libs
    import toml
    import requests

    # Load config file
    try:
        config = toml.load(config_file)
    except Exception as exception:
        Result.exit_failed(f'Cannot load {config_file} : {exception}',
                           f"verify that config_file is in a proper toml format", f"nano {config_file}")

    Result.success(node_type)

    Result.label(f"{node_type} get-ask")
    # GET API URL
    try:
        with open(config_path + "/api", "r") as text_file:
            api_line = text_file.read()
    except Exception as exception:
        Result.exit_failed(f'Cannot read {config_path + "/api"} : {exception}',
                           f"verify the process is running {node_type}", f"epgrep \"boost\"")
    else:
        api = api_line.split("/")
        getask_url = "http://" + api[2] + ":" + api[4] + "/rpc/v0"

    # GET MARKETASK
    jsondata = json.dumps({"jsonrpc": "2.0", "method": "Filecoin.MarketGetAsk", "params": [], "id": 3})
    try:
        getask = \
            json.loads(requests.post(getask_url, data=jsondata, timeout=(TIMEOUT_CONNECT, TIMEOUT_READ)).content)["result"]["Ask"]
    except Exception as exception:
        Result.exit_failed(f'API error : {exception}', "verify the miner API are accessible on the local machine",
                           "curl -v -X PST --data '{ \"method\": \"Filecoin.MarketGetAsk\", \"id\": 3 }' " + getask_url)

    # GET SECTORSIZE
    jsondata = json.dumps({"jsonrpc": "2.0", "method": "Filecoin.ActorSectorSize", "params": [getask["Miner"]], "id": 3})
    try:
        miner_sector_size = \
            json.loads(requests.post(getask_url, data=jsondata, timeout=(TIMEOUT_CONNECT, TIMEOUT_READ)).content)[
                "result"]
    except Exception as exception:
        Result.exit_failed(f'API error : { exception }', "verify boost API is accessible on the local machine", 'curl -v -X PST --data \'{ "method": "Filecoin.ActorSectorSize", "params": ["' + getask["Miner"] + '"], "id": 3 }\' ' + getask_url)

    # VERIFY GET ASK
    if getask['Price'] != "0" or getask['VerifiedPrice'] != "0" or getask['MinPieceSize'] != 256 or getask['MaxPieceSize'] != miner_sector_size:
        Result.exit_failed(f'GET-ASK price has to be set to 0 and your accepting size to min=256B and max={miner_sector_size}', "set the prices and sizes via the boost", f'Connect the boost UI/Settings menu')
    else:
        Result.success()

    # VERIFY IF THE STORAGE DEAL FILTER IS CONFIGURED IN config.toml
    ###
    Result.label(f"[Dealmaking][Filter] activated")

    config_option = "" if ARGS.c == DEFAULT_CONFIG_FILE else f"-c {ARGS.c} "
    try:
        filter_storage = config["Dealmaking"]["Filter"]
    except Exception as exception:
        Result.exit_failed(f'Filter not set in  {config_file}', 'Add the following line to the [Dealmaking] section.', f'Filter = "{os.path.realpath(__file__)} {config_option}--reject"')
    else:
        import re
        if re.match(f'^{os.path.realpath(__file__)}[ ]*--(accept|reject)[ ]*$', filter_storage):
            Result.success()
        else:
            Result.exit_failed(f'"Filter" found in [Dealmaking] section of {config_file}, but doesn\'t match standard lines', 'Add the following line to the [Dealmaking] section and run the --check again.', f'Filter = "{os.path.realpath(__file__)} {config_option}--reject"')

    # VERIFY IF THE RETRIEVAL DEAL FILTER IS CONFIGURED IN config.toml
    ###
    Result.label(f"[Dealmaking][RetrievalFilter] activated")

    config_option = "" if ARGS.c == DEFAULT_CONFIG_FILE else f"-c {ARGS.c} "
    try:
        filter_retrieval = config["Dealmaking"]["RetrievalFilter"]
    except Exception as exception:
        Result.exit_failed(f'RetrievalFilter not set in  {config_file}',
                           'Add the following line to the [Dealmaking] section.',
                           f'RetrievalFilter = "{os.path.realpath(__file__)} {config_option}--reject"')
    else:
        import re
        if re.match(f'^{os.path.realpath(__file__)}[ ]*--(accept|reject)[ ]*$', filter_retrieval):
            Result.success()
        else:
            Result.exit_failed(
                f'"RetrievalFilter" found in [Dealmaking] section of {config_file}, but doesn\'t match standard lines',
                'Add the following line to the [Dealmaking] section and run the --check again.',
                f'RetrievalFilter = "{os.path.realpath(__file__)} {config_option}--reject"')

    Result.allgood()


if __name__ == "__main__":
    # SET COMMANDLINES ARGUMENTS
    PARSER = argparse.ArgumentParser(description="CID gravity storage connector")
    GROUP = PARSER.add_mutually_exclusive_group(required=True)
    PARSER.add_argument("-c",
                        help="config file absolute path (default : " + DEFAULT_CONFIG_FILE + ")",
                        default=DEFAULT_CONFIG_FILE, metavar="PATH")
    GROUP.add_argument("--version", action='version', version=VERSION)
    GROUP.add_argument("--check-boost", help="check connector for BOOST environment", action="store_true")
    GROUP.add_argument("--check-venus", help="check connector for VENUS environment", action="store_true")
    GROUP.add_argument("--reject", help="reject all incoming deals if an error occurs", action="store_true")
    GROUP.add_argument("--accept", help="accept all incoming deals if an error occurs", action="store_true")
    ARGS = PARSER.parse_args()

    if ARGS.check_boost:
        check_boost()
        sys.exit(0)
    elif ARGS.check_venus:
        check_venus()
        sys.exit(0)

    # DEFINE DEFAULT BEHAVIOR IN CASE ERRORS OCCURED
    DEFAULT_BEHAVIOR = "reject" if ARGS.reject else "accept"

    # LOAD CONFIG FILE
    try:
        load_config_file(ARGS.c, DEFAULT_BEHAVIOR)
    except ConfigFileException as exception:
        decision(exception.decision_value, exception.message)

    run()
