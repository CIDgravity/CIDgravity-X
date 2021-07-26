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

try:
    import json
    import sys
    import os.path
    import argparse
    import datetime
    import requests
    import toml
except ImportError as e:
    print("Error: failed to import python required module : " + str(e), file=sys.stderr)
    sys.exit(1)

VERSION = "1.0"

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
    'behavior': {
        'reject_by_default': False,
    },
    'logging': {
        'log_file': '/var/log/lotus/cidgravity_storage_connector.log',
        'debug': False
    }
}

def aborting(msg=""):
    """ PRINT ERROR MESSAGE AND QUIT """
    sys.exit(f"Aborting! Error : {msg}")

def log(msg, code="", level="INFO"):
    """ logging decision and debug to a local file """
    with open(CONFIG["logging"]["log_file"], 'a') as logfile:
        output_date = datetime.datetime.now().strftime("%Y-%m-%dT%H:%M:%S")
        print('{0:<20} {1:<6} {2:<12} {3:>}'.format(output_date, level, code, msg), file=logfile)

def load_config_file(abs_path):
    """ LOAD CONFIGURATION FILE """
    if not os.path.isfile("/" + abs_path):
        aborting(abs_path + " is not accessible or an absolute path")

    try:
        new_config = toml.load(abs_path)
    except Exception as exception:
        aborting(f'Cannot load { abs_path } : { exception }')

    # VERIFY THAT ALL TOML MANDATORY FILEDS EXIST
    for section_name, section in  CONFIG.items():
        for variable_name, value in section.items():
            try:
                new_value = new_config[section_name][variable_name]
            except Exception as exception:
                if value == '':
                    aborting("[" + section_name + "][" + variable_name + "] missing in config file")
            else:
                CONFIG[section_name][variable_name] = new_value

    # VERIFY IF reject_by_default VALUE IS A BOOLEAN
    if not isinstance(CONFIG["behavior"]["reject_by_default"], bool):
        aborting(f"[behavior][reject_by_default] is not a boolean : {type(CONFIG['behavior']['reject_by_default'])}")

    # VERIFY IF LOG_FILE IS WRITABLE
    try:
        open(CONFIG["logging"]["log_file"], 'a').close()
    except Exception as exception:
        aborting(f'log_file access error : {exception}')

    # VERIFY IF DEBUG VALUE IS A BOOLEAN
    if not isinstance(CONFIG["logging"]["debug"], bool):
        aborting(f"[logging][debug] is not a boolean : {type(CONFIG['logging']['debug'])}")

def decision(value, internal_message, external_message=""):
    """ terminate script execution by printing messages and exiting with the appropriate code"""
    decision_msg = 'REJECTED' if value else 'ACCEPTED'
    print("Deal " + decision_msg + external_message)
    log(internal_message, decision_msg)
    sys.exit(value)

def run():
    """ check deal acceptance against api each time lotus
    calls the script and provide the proposal json on stdin"""

    reject_by_default_behavior = CONFIG["behavior"]["reject_by_default"]

    # GET STDIN JSON PROPOSAL
    try:
        deal_proposal = json.load(sys.stdin)
    except json.decoder.JSONDecodeError as exception:
        decision(reject_by_default_behavior, f"JSON unable to parse the DealProposal : {exception}")

    # SET HEADERS
    headers = {
        'Authorization': 'Bearer ' + CONFIG["api"]["token"],
        'X-CIDgravity-Agent': 'CIDgravity-storage',
        'X-CIDgravity-Version': VERSION
    }

    # CALL API
    try:
        response = requests.post(CONFIG["api"]["endpoint"], json=deal_proposal, headers=headers)
        if CONFIG["logging"]["debug"]:
            log(json.dumps(deal_proposal, indent=4, sort_keys=True), "CLIENT_REQ", "DEBUG")
    except requests.exceptions.RequestException  as exception:
        decision(reject_by_default_behavior, f"API error : { exception }")

    # MANAGE HTTP ERROR
    if response.status_code != 200:
        if CONFIG["logging"]["debug"]:
            log(json.dumps(dict(response.headers), indent=4, sort_keys=True) + "\n" + str(response.content), "API_RESPONSE", "DEBUG")
        decision(reject_by_default_behavior, f"API error : { response.status_code } - { response.reason }")

    # READ API RESPONSE
    try:
        api_result = response.json()
        if CONFIG["logging"]["debug"]:
            log(json.dumps(api_result, indent=4, sort_keys=True), "API_RESPONSE", "DEBUG")
    except json.decoder.JSONDecodeError as exception:
        decision(reject_by_default_behavior, f"API unable to parse JSON { exception }")


    # APPLY DECISION
    decision(api_result['acceptProposal'], api_result['message'])

def check():
    """ CHECK PROCESS """
    print("XXX Checking lotus")
    print("XXX Checking if the script is properly set in the config file of lotus")
    print("XXX Checking Default Price")
    print("XXX Checking API connectivity")
    print("XXX Checking Script version")
    sys.exit(0)

if __name__ == "__main__":
    # SET COMMANDLINES ARGUMENTS
    PARSER = argparse.ArgumentParser(description="CID gravity storage connector")
    GROUP = PARSER.add_mutually_exclusive_group(required=True)
    PARSER.add_argument("-c",
                        help="config file absolute path (default : " + DEFAULT_CONFIG_FILE + ")",
                        default=DEFAULT_CONFIG_FILE, metavar="PATH")
    GROUP.add_argument("--version", action='version', version=VERSION)
    GROUP.add_argument("--check", help="check connector environment", action="store_true")
    GROUP.add_argument("--run", help="run the connector", action="store_true")
    ARGS = PARSER.parse_args()

    # LOAD CONFIG FILE
    load_config_file(ARGS.c)

    if ARGS.check:
        check()

    run()
