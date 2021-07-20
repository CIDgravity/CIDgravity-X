# Getting started

This script is runned by the miner to send every deal proposal to SAT API.
Our API will analysed data included in the proposal to match the rules you have set on our web application


# Set up the script

1. Clone this repo

```
git clone https://github.com/TwinQuasar/SAT_Python
```

2. Set your API token by editing the script (change line 10 by your token)

Your token can be found using our web application under the tab "My account"

```python
API_ENDPOINT = 'http://localhost:3000/api/proposal/check'
YOUR_API_TOKEN = 'PUT YOUR TOKEN HERE'
```

3. Set your miner prices to the minimun

Because the lotus rules are applied first, to delegate the rules management to our API, you must set many values to the minimun / maximun (including price, min deal size, max deal size and duration)

```
lotus-miner storage-deals set-ask --price 0 --verified-price 0 --min-piece-size [MINER_MIN_VALUE] --max-piece-size [MINER_MAX_VALUE]
```

4. Config your miner to send deal proposal

Edit the file .lotusminer/config.toml and change the value of Filter

```
Filter = "/path/to/python/script/handling_deal_proposals.py
```

6. Set the default behavior

In some case our API may be unavailable (during the test period), so to avoid declined or accept deal proposals, you can define a default behavior that will be applied if an error happen.

To set this, you need to add a parameter to script in your config.toml file

```
Filter = "/path/to/python/script/handling_deal_proposals.py --default-behavior [true to accept deal, false to decline them]
```

7. Restart your miner

To apply the new configuration settings, you need to restart your miner
