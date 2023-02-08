The "CIDgravity connector" connects a lotus-miner to the CIDgravity service. 
This lighweight connector is executed locally by the lotus-miner process each time the lotus-miner receives a deal proposal.

# Requirements 
1. Get a CIDgravity account : https://cidgravity.com
2. Depending of your setup :
        - Boost : deploy CIDgravity Connector on the boost node server
        - Monolitic lotus : deploy CIDgravity Connector on your miner only (if you don't know what is split store, you probably run a Monolitic lotus)
        - Split Store lotus : deploy CID gravity Connector on all markets node instead of the miner
3. Set your get-ask prices to 0 and size to the widest range :
  - Boost : using the boost UI
  - Lotus : 
```
lotus-miner storage-deals set-ask --price 0 --verified-price 0 --min-piece-size 256 --max-piece-size MINER_SEC_SIZE
```
4. Install python modules : toml and requests
```
sudo apt install python3-toml python3-requests
```

# Get Started
1. Install the connector
```
sudo -i -u USER_RUNNING_LOTUS_MINER_PROCESS
git clone https://github.com/CIDgravity/CIDgravity-X.git
cd CIDgravity-X
```
2. Add your CIDgravity authentification TOKEN (TOKEN is located under the "Settings" section on the CIDgravity portal > tab "Other settings") and set the logfile location to the CIDgravity config file
```
cp cidgravity_storage_connector.toml.sample cidgravity_storage_connector.toml
nano ./cidgravity_storage_connector.toml
```
3. Execute the check process
```
./cidgravity_storage_connector.py --check
```
4. Enable "CIDgravity connector" in lotus-miner or boost config.toml under the [Dealmaking] section
```
Filter = "ABSOLUTE_PATH/cidgravity_storage_connector.py --reject"
RetrievalFilter = "ABSOLUTE_PATH/cidgravity_storage_connector.py --reject"
```
5. Restart boost or lotus-miner

DONE :) you can now enjoy CIDgravity
