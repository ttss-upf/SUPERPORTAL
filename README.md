install required package: run "npm i" in the server folder.
run app: run "npm run serve" in the server folder.
<<<<<<< HEAD
REPLACE REDIS "room_list" with this:
{"name":"Pirate","url":"./images/pirate_island.png","id":0,"online_num":0,"weather":"snow","default":true,"people":[],"range":[-300,300],"exits":[-30,-60],"leadsTo":"Beach"},{"name":"Beach","url":"./images/beach_night.png","id":1,"default":false,"online_num":0,"weather":"rain","people":[],"range":[-300,300],"exits":[-285,80],"objects":{"tree":{"coordinates":[-218,-39,-277,-43,-244,-145],"centroid":[-246,-76],"size":"big","reactionFacing":3,"reactionGait":"jumping","reactionAction":"none"},"rock":{"coordinates":[162,10,172,10],"centroid":[167,10],"size":"small","reactionFacing":3,"reactionGait":"idle","reactionAction":"sit"}},"leadsTo":"Pirate"}


[
    {
        "name":"Beach",
        "url":"./images/beach_night.png",
        "id":1,
        "default":false,
        "online_num":0,
        "weather":"rain",
        "people":[

        ],
        "range":[
            -300,
            300
        ],
        "exits":[
            -285,
            80
        ],
        "objects":{
            "tree":{
                "coordinates":[
                    -218,
                    -39,
                    -277,
                    -43,
                    -244,
                    -145
                ],
                "centroid":[
                    -246,
                    -76
                ],
                "size":"big",
                "reactionFacing":3,
                "reactionGait":"jumping",
                "reactionAction":"none"
            },
            "rock":{
                "coordinates":[
                    162,
                    10,
                    172,
                    10
                ],
                "centroid":[
                    167,
                    10
                ],
                "size":"small",
                "reactionFacing":3,
                "reactionGait":"idle",
                "reactionAction":"sit"
            }
        },
        "leadsTo":[
            "Pirate"
        ]
    },
    {
        "name":"Pirate",
        "url":"./images/pirate_island.png",
        "id":0,
        "online_num":0,
        "weather":"snow",
        "default":true,
        "people":[

        ],
        "range":[
            -300,
            300
        ],
        "exits":[
            -30,
            -60
        ],
        "leadsTo":[
            "Beach"
        ]
    }
]
=======

update REDIS data from the object in the "data_rep.json" file in the "for_reference" folder

>>>>>>> assign2-v2
