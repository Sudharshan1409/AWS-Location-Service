import json
import boto3
import itertools
from datetime import datetime

client = boto3.client('location')

def lambda_handler(event, context):
    # TODO implement
    
    print('event', event['queryStringParameters'])
    if event['queryStringParameters']['type'] == 'multipleRoutes':
        waypoints = json.loads(event['queryStringParameters']['waypoints'])
        
        print('waypoints', waypoints)
        
        sourceCoordinates = client.search_place_index_for_text(IndexName = "MyIndex", Text = event['queryStringParameters']['source'])['Results'][0]['Place']['Geometry']['Point']
    
        destinationCoordinates = client.search_place_index_for_text(IndexName = "MyIndex", Text = event['queryStringParameters']['destination'])['Results'][0]['Place']['Geometry']['Point']
    
        waypointsCoordinates = []
    
        for waypoint in waypoints:
            waypointsCoordinates.append(client.search_place_index_for_text(IndexName = "MyIndex", Text = waypoint)['Results'][0]['Place']['Geometry']['Point'])
        
        print("source:", sourceCoordinates)
        print("destination:", destinationCoordinates)
        print("waypoints:", waypointsCoordinates)
        
        waypointPermutations = list(itertools.permutations(waypointsCoordinates))
        
        print("waypointPermutations:", waypointPermutations)
        
        allPossibleRoutes = []
        minimumDistance = 99999
        minimumIndex = None
        
        for index, waypoint in enumerate(waypointPermutations):
            routeResp = client.calculate_route(CalculatorName = "MyCalculator", DeparturePosition = [sourceCoordinates[0], sourceCoordinates[1]], DestinationPosition = [destinationCoordinates[0], destinationCoordinates[1]], WaypointPositions = waypoint, DistanceUnit = "Miles", IncludeLegGeometry = True)
            allPossibleRoutes.append({
                'distance': routeResp['Summary']['Distance'],
                'route': routeResp,
            })
            if routeResp['Summary']['Distance'] < minimumDistance:
                minimumDistance = routeResp['Summary']['Distance']
                minimumIndex = index
        
        print("allPossibleRoutes:", allPossibleRoutes)
        print("minimumDistance:", minimumDistance)
        print("minimumIndex", minimumIndex)
        
        response = {
            'statusCode': 200,
            'headers': {
                "Access-Control-Allow-Headers": "*",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "*",
                "Content-Type": "application/json",
            },
            'body': json.dumps({
                'sourceCoordinates': sourceCoordinates,
                'destinationCoordinates': destinationCoordinates,
                'waypointsCoordinates': waypointsCoordinates,
                'minimumIndex': minimumIndex,
                'allPossibleRoutes': allPossibleRoutes
            })
        }
    
    elif event['queryStringParameters']['type'] == 'tracker':
        devicePositionsList = []
        paginator = client.get_paginator('get_device_position_history')
        devicePositions = paginator.paginate(
            DeviceId=event['queryStringParameters']['DeviceId'],
            StartTimeInclusive=datetime(2020, 1, 1),
            EndTimeExclusive=datetime.now(),
            TrackerName=event['queryStringParameters']['TrackerName'],
        )
        print("devicePositions", devicePositions)
        for device in devicePositions:
            print("position", device['DevicePositions'])
            for position in device['DevicePositions']:
                devicePositionsList.append(position['Position'])
        
        if not devicePositionsList:
            devicePositionsList.append([-77.533, 38.9655])
        
        print('devicePositionsList', devicePositionsList)
        deviceUpdateResponse = client.batch_update_device_position(
            TrackerName=event['queryStringParameters']['TrackerName'],
            Updates=[
                {
                    'DeviceId': event['queryStringParameters']['DeviceId'],
                    'Position': [
                        devicePositionsList[-1][0] + 0.05,
                        devicePositionsList[-1][1] + 0.05,
                    ],
                    'SampleTime': datetime.now()
                },
            ]
        )
        print('deviceUpdateResponse', deviceUpdateResponse)
        response = {
            'statusCode': 200,
            'headers': {
                "Access-Control-Allow-Headers": "*",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "*",
                "Content-Type": "application/json",
            },
            'body': json.dumps({
                'devicePositionsList': devicePositionsList,
                'deviceId': event['queryStringParameters']['DeviceId'],
                'trackerName': event['queryStringParameters']['TrackerName']
            })
        }
    elif event['queryStringParameters']['type'] == 'geofence':
        geofenceResponse = client.batch_evaluate_geofences(
            CollectionName=event['queryStringParameters']['CollectionName'],
            DevicePositionUpdates=[
                {
                    'DeviceId': event['queryStringParameters']['DeviceId'],
                    'Position': json.loads(event['queryStringParameters']['Position']),
                    'SampleTime': datetime.now()
                },
            ]
        )
        response = {
            'statusCode': 200,
            'headers': {
                "Access-Control-Allow-Headers": "*",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "*",
                "Content-Type": "application/json",
            },
            'body': json.dumps({
                'geofenceResponse': geofenceResponse
            })
        }
    return response