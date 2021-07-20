#!/usr/bin/python3

import json
import requests
import sys
import toml
import os.path


def main(config):

    try:
        deal_proposal = json.load(sys.stdin)
        response = requests.post(config['api']['endpoint'], json=deal_proposal, headers={'Authorization': 'Bearer ' + config['api']['token']})

        if response.status_code == 200:
            api_result = response.json()
            print(api_result['message'])
            return api_result['acceptProposal']
        else:
            print("Received wrong return code, default behavior applied (reason : " + response.reason + ")")
            return config['behavior']['default']

    except requests.exceptions.Timeout as err:
        print("Timeout exception in filter, default behavior applied (message : " + str(err.response) + ")")
        return config['behavior']['default']
    except requests.exceptions.TooManyRedirects as err:
        print("TooManyRedirects exception in filter, default behavior applied (message : " + str(err.response) + ")")
        return config['behavior']['default']
    except requests.exceptions.RequestException as err:
        print("General exception in filter, default behavior applied (message : " + str(err.response) + ")")
        return config['behavior']['default']
    except json.decoder.JSONDecodeError as err:
        print("Unable to parse the ProposalDeal JSON, default behavior applied (message : " + str(err.response) + ")")
        return config['behavior']['default']


if __name__ == "__main__":

    config_path = os.path.dirname(os.path.realpath(__file__))

    if os.path.isfile(config_path + '/config.toml'):
        config = toml.load(config_path + '/config.toml')
        exit_code = main(config)
        sys.exit(not exit_code)
    else:
        print("The configuration file isn't found. Pull it from Github to launch the script !")

