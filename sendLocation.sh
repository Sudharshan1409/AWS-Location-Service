#!/bin/bash

LAT=76
LONG=12

# Basic while loop
while [ true ]
    do
        echo 'starting...'
        DEVICENAME="$2"
        TIME=$(date +%s)


        UPDATE="DeviceId=$DEVICENAME,Position=$LAT,$LONG,SampleTime=$TIME"

        echo "$UPDATE"

        aws location \
            batch-update-device-position \
            --tracker-name $1 \
            --updates $UPDATE \
            --region us-east-2

        let LAT+=1
        let LONG+=1
        sleep 5
    done

echo All done