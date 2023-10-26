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
