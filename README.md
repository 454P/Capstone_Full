<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
# Capstone_Full
=======
# backend
>>>>>>> 0018d163130115de2d44f7d20020c2d93a6c16c3
=======
# Frontend
>>>>>>> 2e644a9152a94314e4d78d3ca2187a61ecf9fd8b
=======
# Model
Machine Learning repository

## BACKEND MEMO
Solution we might need after rebooting or setting new environment 

### successful NUMA node read from SysFS had negative value
check node using 
```
lspci | grep -i nvidia
```

numa node is in devices directory

```
cat /sys/bus/pci/devices/"device dir"/numa_node
```

trigger to 0 using
```
echo 0 | sudo tee -a /sys/bus/pci/devices/"device dir"/numa_node
```
>>>>>>> afc5af7c78c1b67cacee72391be028ef3b727a8e
