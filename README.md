# Getting started

The "CID gravity connector" connects a lotus-miner to the CIDgravity service. 
This lighweight connector is executed locally by the lotus-miner process each time the lotus-miner receives a deal proposal.
```
 --------                --------------------------------                ----------------------------  
| Client | --- Deal --> | miner --> CIDgravity connector | --- Deal --> | CID gravity Cloud platform |
 --------                --------------------------------                ----------------------------
                                      ^                                                  |
                                      !-------- Decision Accept/Reject--------------------
```
# Requirements 
1. A CIDgravity account
2. Set your get-ask prices to 0 and size to the widest range : 
```
lotus-miner storage-deals set-ask --price 0 --verified-price 0 --min-piece-size 256 --max-piece-size <MINER_SECTOR_SIZE>
```
3. Install python modules : toml and requests
```
sudo apt install python3-toml python3-requests
```
# Get Started

```
sudo -i -u <USER_RUNNING_LOTUS_MINER_PROCESS>
git clone https://github.com/CIDgravity/CIDgravity-X.git

# EXECUTE THE CHECK PROCESS AND FOLLOW ON-SCREEN INSTRUCTION
./cidgravity_storage_connector.py --check
```
