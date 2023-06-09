import React, { useState } from 'react';
import meeple from "./assets/meeple.png";

const TILE_TYPES = ['forest', 'farmland', 'water'];
const RESOURCE_TYPES = ["food", "wood"]

const ACTIONS = [
    { name: 'Gather resources', currentTenseName: "Gathering resources", tileTypes: ['forest'], resourceDelta: {food: 5, wood: 2} },
    { name: 'Prepare land for farming', currentTenseName: "Preparing land for farming", tileTypes: ['forest'] , resourceDelta: {wood: -2} },
    { name: 'Tend to farm', currentTenseName: "Tending to farm", tileTypes: ['farmland'], resourceDelta: {food: 7}  },
    { name: 'Fish', currentTenseName: "Fishing", tileTypes: ['water'], resourceDelta: {food: 6}  },
];

class Tile{
    constructor(key, row, column, type){
        this.key = key;
        this.r = row;
        this.c = column;
        this.type = type;
        this.villagers = 0;
        this.action = null;
    }

    setAction = (action) => {
        this.action = action;
    }

    getValidActions = () => {
        let result = [];

        for(let i = 0; i < ACTIONS.length; i++) {
            if(ACTIONS[i].tileTypes.includes(this.type)){
                result.push(ACTIONS[i]);
            }
        }
        return result;
    }
}

const GRID_SIDE = 5;

const i2k = (x, y) => {
    return x.toString() + "_" + y.toString();
}

const easterIslandGrid = () => {
    
    let types = [
        ["water", "water", "water", "water", "water"],
        ["water", "water", "forest", "water", "water"],
        ["water", "forest", "forest", "forest", "forest"],
        ["water", "forest", "forest", "water", "water"],
        ["water", "water", "water", "water", "water"],
    ];

    let grid = {};
    for (let i = 0; i < GRID_SIDE; i++){
        for (let j = 0; j < GRID_SIDE; j++){
            grid[i2k(j, i)] = new Tile(i2k(j, i), j, i, types[i][j]);
        }
    }
    return grid;
}

const newDefaultTileGrid = (scenario_name) => {

    if (scenario_name === "Easter Island") return easterIslandGrid();

    let grid = {};
    for (let i = 0; i < GRID_SIDE; i++){
        for (let j = 0; j < GRID_SIDE; j++){
            grid[i2k(i, j)] = new Tile(i2k(i, j), i, j, TILE_TYPES[i % TILE_TYPES.length]);
        }
    }
    return grid;
}

const getResourceReportOfTile = (tile) => {
    if (tile.action === null) {return {}}
    if (tile.villagers === 0) {return {}}

    let action = tile.action;
    let report = {};

    for(let resource in action.resourceDelta){
        if(!(resource in report)){report[resource] = 0;}
        report[resource] += action.resourceDelta[resource] * tile.villagers;
    }
    return report;
}

const getResourceReportOfGrid = (grid) => {
    let report = {};

    for(let i = 0; i < RESOURCE_TYPES.length; i++) {
        report[RESOURCE_TYPES[i]] = 0;
    }

    for(let key in grid){
        let tile = grid[key];
        let tile_report = getResourceReportOfTile(tile);
        for(let tile_resource in tile_report) {
            report[tile_resource] += tile_report[tile_resource];
        }
    }
    return report;
}

const iterateOverGridInRowOrder = (grid) => {
    
    let result = []
    for (let i = 0; i < GRID_SIDE; i++){
        for (let j = 0; j < GRID_SIDE; j++){
            result.push(grid[i2k(i, j)]);
        }
    }
    return result;
}

const Meeples = ({count}) => {
    return (<div>

    {[...Array(count)].map((e, i) => <Meeple key={i}/>)}
    </div>)
}

const Meeple = () => {
    return (
        <img src={meeple} style={{width:"30px"}} alt="Meeple icon representing a villager"></img>
    )
}

const meterN = 10;

const societyMeterColorAtX = (x) => {
    let red = [255, 0, 0];
    let green = [0, 255, 0];

    let b = (x+1) / meterN;
    let a = 1 - b;
    
    let res = [
        red[0] * a + green[0] * b,
        red[1] * a + green[1] * b,
        red[2] * a + green[2] * b,
    ]

    return "rgba(" + res[0].toString() + ", " + res[1].toString() + ", " + res[2].toString() + ", 70%)"
}

const Fact = (props) => {
    const [isOpen, setIsOpen] = useState(false);

    if(isOpen) {
        return (<div className="fact-unlocked" style={{flexDirection: "column"}}>{props.children}</div>)
    } else {
        if(props.credits > 0) {
            return (
                <div className="fact-locked">
                    <button className="button-38" onClick={() => {setIsOpen(true); console.log("set is open to true?"); props.setCredits(props.credits-1);}}>Unlock this fact</button>
                </div>)
        } else {
            return (<div className="fact-locked">
                <i>Advance a turn to unlock</i>
            
            </div>)
        }
    }
}

const countOfTypeInGrid = (grid, type) => {
    let result = 0;

    for(let key in grid){
        if(grid[key].type === type){result += 1}
    }
    return result;
}

const DEMANDS = {
    "Easter Island": [
        {
            name: "Famine",
            flavor: <p>The island's population was around 3,000 people and all of these people depended on the island's limited resources, like its palm tree for food and shelter. One theory posits that the people overexploited the island's resources (palm trees) which they used to build canoes, shelter, and to cook food. As a result, the palm trees began to decline which led to soil erosion and decline in agricultural productivity. The population eventually plummeted to around 111 people and in order to survive cannibalism came forth in some cases.

            <a href="https://www.npr.org/sections/krulwich/2013/12/09/249728994/what-happened-on-easter-island-a-new-even-scarier-scenario">Read more</a>
            </p>,
            activation: {
                "robot": (game) => {return game.turns >= 1},
                "human": "turn is at least 1"
            },
            satisfaction: {
                "robot": (game) => {console.log(game.resources, game.resources.food, game.getUpkeepOf("food") * 2); return game.resources.food < (game.getUpkeepOf("food") * 2)},
                "human": "have less food is less than what is consumed in 2 turns"
            },
            reward: {
                "robot": {score: -1},
                "human": "-1 meeple"
            },
            penalty: {
                "robot": {},
                "human": "none"
            }, allocateVillagersToMeet: 0,
        }, {
            name: "Deforestation",
            flavor: <p>
                    The collapse of Easter Island shows that Rapa Nui people were responsible for their demise as it was attributed to the overexploitation of resources (deforestation). Using radiocarbon dating of plant samples, it can be found  that deforestation started around the arrival of a significant human population to the island and was essentially complete by the sixteenth century.

                    <a href="https://rainforests.mongabay.com/09easter_island.htm">Read more</a>
                </p>,
                activation: {
                    "robot": (game) => {return game.turns >= 1},
                    "human": "turn is at least 1"
                },
                satisfaction: {
                    "robot": (game) => {return countOfTypeInGrid(game.grid, "forest") <= 3},
                    "human": "you have less than 4 forest tiles remaining"
                },
                reward: {
                    "robot": {score: -1},
                    "human": "-1 meeple"
                },
                penalty: {
                    "robot": {},
                    "human": "none"
                }, allocateVillagersToMeet: 0,
        }, {
            name: "Population Growth",
            flavor: <p>
                    By about 1370 C.E., researchers believe that population growth in Rapa Nui reached its maximum at about 5,000 people. Facing stress from prolonged droughts and salt-laden winds, Rapa Nui’s population struggled to balance the island’s limited resources with the population numbers. (McAnany, 2021) 

                </p>,
                activation: {
                    "robot": (game) => {return game.turns >= 5},
                    "human": "turn is at least 5"
                },
                satisfaction: {
                    "robot": (game) => {return game.villagers >= 7},
                    "human": "you have at least 7 meeples"
                },
                reward: {
                    "robot": {score: -1},
                    "human": "-1 meeple"
                },
                penalty: {
                    "robot": {},
                    "human": "none"
                }, allocateVillagersToMeet: 0,
        }, {
            name: "Maoi Construction",
            flavor: <p>
                    The iconic Easter Island statues (Moai) represent the ancestral chiefs of the Rapa Nui people who were believed to have god-like powers.
                    The statues were carved out of volcanic tuff and ranged in height from 7 to 70 feet high and weighed between 10 to 12 metric tons.
                    Experts suggest that each statue took around 40 individuals to carve and move and some 300-400 more people to make the rope and food for each project.

                    <a href="https://www.metmuseum.org/toah/hd/eais/hd_eais.htm">Read more.</a>
                </p>,
                activation: {
                    "robot": (game) => {return game.turns >= 3 && game.turns <= 5;},
                    "human": "turn is between 3 and 5"
                },
                satisfaction: {
                    "robot": (game) => {return game.demandsAllocatedTo.includes("Maoi Construction")},
                    "human": "you allocate one meeple to this action"
                },
                reward: {
                    "robot": {score: 2, },
                    "human": "1 meeple"
                },
                penalty: {
                    "robot": {score: -1},
                    "human": "-1 meeple"
                }, allocateVillagersToMeet: 1
        }, {
            name: "European Contact",
            flavor: <p>
                Europeans first made contact with the Rapa Nui people on Easter Sunday in 1722.
                Led by Dutch navigator, Jacob Roggeveen, these Europeans brought with them many Western diseases, such as tuberculosis,
                smallpox, and dysentery. One Dutch officer who was apart of this first voyage wrote of the encounter, saying “During the morning
                [the captain] brought an Easter Islander onboard with his craft. This hapless creature seemed to be very glad to behold us, and
                he showed the greatest wonder at the build of our ship. He took special notice of the tautness of our spars, the stoutness of our
                rigging and running gear, the sails, the guns, which he felt all over with minute attention and with everything else that he saw".

                <a href="https://www.americanscientist.org/article/rethinking-the-fall-of-easter-island">Read more.</a>
            </p>,
            activation: {
                "robot": (game) => {return game.turns >= 10;},
                "human": "turn is at least 10"
            },
            satisfaction: {
                "robot": (game) => {return game.demandsAllocatedTo.includes("Maoi Construction")},
                "human": "you allocate two meeples to communicate, trade (representing impact caused by foreign contact)."
            },
            reward: {
                "robot": {},
                "human": "none"
            },
            penalty: {
                "robot": {score: -2},
                "human": "-2 meeples"
            }, allocateVillagersToMeet: 2
        }

        
    ]
}

const ClimateGame = ({scenario_name}) => {
    const [score, setScore] = useState(Math.floor(meterN / 2));
    const [credits, setCredits] = useState(1);
    const [grid, setGrid] = useState(newDefaultTileGrid(scenario_name));
    const [villagers, setVillagers] = useState(score);
    const [turns, setTurn] = useState(1);
    const [resources, setResources] = useState({
    wood: 20,
    food: 35,
    });
    const [demandsAllocatedTo, setDemandsAllocatedTo] = useState([]);
    
    
    const changeVillagerCountOnTile = (tile, delta) => {
        /*
         * `delta` villagers will be taken from the general pool and added to the tile pool 
         * So, +1 increments the tile villagers count (taking from available pool), and -1 decrements from the tile.
         * 
        */

        let newGrid = {...grid};
        // special case for cancel; if no villagers and "decrement", reset the action to null
        console.log(tile.villagers, delta, tile.villagers === 0, delta === -1, tile.villagers === 0 && delta === -1)
        if(newGrid[tile.key].villagers === 0 && delta === -1) {

            newGrid[tile.key].action = null;
            
        } else {
            // no action should leave either total pool or tile pool with negative villagers
            if(villagers - delta >= 0 && tile.villagers + delta >= 0){ 
                setVillagers(villagers - delta);
                let new_villagers_on_tile = newGrid[tile.key].villagers + delta;
                newGrid[tile.key].villagers = new_villagers_on_tile;

                if (new_villagers_on_tile === 0) {
                    newGrid[tile.key].action = null;
                }
            }
        }

        setGrid(newGrid);
        
    };

    const getUpkeepOf = (resource) => {
        if (resource === "food") {
            return villagers * 3;
        }
        if (resource === "wood") {
            return 0;
        }

        return 0;
    }

    const gameDict = () => {
        return {
            grid: grid,
            setGrid: setGrid,
            turns: turns,
            villagers: villagers,
            setVillagers: setVillagers,
            resources: resources,
            setResources: setResources,
            getUpkeepOf: getUpkeepOf,
            demandsAllocatedTo: demandsAllocatedTo,
            setDemandsAllocatedTo: setDemandsAllocatedTo,
        }
    }

    const getReportOfDemands = () => {
        let game = gameDict();

        let report = {}

        for(let i=0; i < DEMANDS[scenario_name].length; i++){
            let demand = DEMANDS[scenario_name][i];

            let isActive = demand.activation.robot(game);
            let isSatisfied = demand.satisfaction.robot(game);
            let relevantDelta;
            if(isActive) {
                if(isSatisfied){
                    relevantDelta = demand.reward.robot;
                } else {
                    relevantDelta = demand.penalty.robot;
                }
                for(let deltaKey in relevantDelta) {
                    if(!(deltaKey in report)){report[deltaKey] = 0}
                    report[deltaKey] += relevantDelta[deltaKey];
                }
            }
            
        }
        return report;
    }

    const advanceTurn = () => {

        let report = getResourceReportOfGrid(grid);
        let demandReport = getReportOfDemands();
        let newResources = {...resources};
        let newGrid = {...grid};

        for(let resource in report){
            newResources[resource] += report[resource];
            newResources[resource] += getUpkeepOf(resource);
            newResources[resource] += resource in demandReport ? demandReport[resource] : 0;
        }

        for(let tile_key in newGrid){
            if(newGrid[tile_key].action !== null){
                if(newGrid[tile_key].action.name === "Prepare land for farming"){newGrid[tile_key].type="farmland"}
            }
            newGrid[tile_key].villagers = 0;
            newGrid[tile_key].action = null;
        }


        setResources(newResources);
        let newScore = Math.min(meterN - 1, score + ("score" in demandReport ? demandReport["score"] : 0));
        setScore(newScore);
        setVillagers(newScore);
        setTurn(turns + 1);
        setGrid(newGrid);
        setCredits(credits + 1);
    }

    let resourceChangeReport = getResourceReportOfGrid(grid);

    const actionFlavorText = {
        "Easter Island": {
            "Fish": (<p>
                Researchers in 2013 were surprised by the lack of seafood in the diet of the inhabitants of the Rapa Nui.
                According to Amy Commendador at Idaho State University, "Traditionally, from Polynesian cultures you have a heavy predominance of using marine products, especially in the early phase of colonization"

                <a href="https://www.archaeology.org/news/1329-130926-easter-island-diet-rats">Read more</a>
                </p>),
            "Gather resources" : (<p>The Rapa Nui people relied heavily on palm trees. They used palm trees in all aspects of life. Palm trees were the material used to create canoes. Palm trees were used to construct their homes. Palm trees were even used to cook their meals.  <a href="https://evols.library.manoa.hawaii.edu/server/api/core/bitstreams/b6b8c73f-cf75-4db5-816d-a32babff8fa9/content">Read more</a></p>),
            "Prepare land for farming" : (<p>Rapa Nui cultivation was mainly focused on sweet potatoes. Sweet potatoes originated from South America,
                which would suggest an interaction between the two regions. However, recent research by Muñoz-Rodríguez et al. (2018) suggests otherwise;
                their research indicates that the crop arrived in Polynesia by long-distance dispersal in pre-human times. <a href="https://www.sciencedirect.com/science/article/pii/S096098221830321X">Read more</a></p>), 
            "Tend to farm" : (<p>The Rapa Nui people's diets consisted of things like rats and chickens and plants like sweet potatoes, yams and bananas. <a href="https://www.livescience.com/39926-easter-islanders-ate-rats.html">Read more</a></p>),
        }
    }

    return (
    <div style={{display:"flex", flexDirection:"row", justifyContent: "space-around"}}>
        <div>
            <div className="tile-grid" style={{width: "60vw", height:"100vh"}}>
            {iterateOverGridInRowOrder(grid).map((tile, index) => (
                
                <div
                    className={"centerBoth cell tile-type-" + tile.type}
                    style={{flexDirection: "row"}}
                    key={index}
                >
                    
                    {tile.action !== null ? 
                        (<div className="centerBoth" style={{flexDirection: "column", width: "80%"}}>                    
                            
                            <b>{tile.action.currentTenseName}</b>

                            <br/>
                            
                            <div style={{display:"flex", flexDirection: "row", justifyContent: "space-between"}}>
                                <button className="button-38" style={{marginRight: "6px"}} onClick={() => changeVillagerCountOnTile(tile, -1)}>{tile.villagers > 0 ? "-" : "cancel"}</button>
                                <Meeples count={tile.villagers}/>
                                <button className="button-38" disabled={villagers === 0} style={{marginLeft: "6px"}} onClick={() => {changeVillagerCountOnTile(tile, +1); console.log(getResourceReportOfTile(tile))}}>+</button>
                            </div>
                        </div>)
                    :
                        (
                            <div className="centerBoth" style={{flexDirection: "column", height: "100%"}}>
                                
                                    {tile.getValidActions().map((action, index) => (
                                        <div style={{display: "flex", justifyContent: "center"}}>
                                            <button className="button-38" disabled={villagers === 0} key={index} onClick={() => {
                                                let newGrid = {...grid};
                                                newGrid[tile.key].action = action;
                                                newGrid[tile.key].villagers = 1;
                                                setVillagers(villagers - 1);

                                                setGrid(newGrid);
                                            }}>
                                                {action.name}
                                            </button>
                                        </div>
                                    ))}
          
                            </div> 
                        )
                    }
                </div>
                ))}
            </div>
        </div>

        <div style={{flexGrow: 1, display: "flex", flexDirection: "column", height: "100wh"}}>

            <div style={{display: "flex", flexDirection: "row", justifyContent: "space-around"}}>
                <h1>Scenario: {scenario_name}</h1>
                <h1>Turn {turns}</h1>
            </div>

            <div style={{display: "flex", justifyContent: "center", paddingBottom: "15px"}}>
                <div style={{display: "flex", width:"36vw"}}>
                {[...Array(meterN)].map((e, i) => <div className="meterBarCell" style={{display: "flex", justifyContent: "center", height: "40px", width: (100/meterN).toString() + "%", backgroundColor: societyMeterColorAtX(i)}} key={i}>
                    <p style={{fontSize: "35px", color: (i === score ? "rgba(255,255,255,1)" : "rgba(0,0,0,0.3"), position: "absolute"}}>{i}</p>                    
                </div>)}

                </div>
            </div>
           
            
            <div style={{flexGrow: 1, display:"flex", flexDirection:"row", justifyContent: "space-around"}}>
                <div style={{display: "flex", flexDirection: "column"}}>
                    
                    <div style={{flex: "content"}}>
                        <h3>Overview</h3>
                        <div className="dashboard" >

                            <div style={{display: "flex", justifyContent: "center"}}>
                                <table style={{width: "20vw"}}>
                                    <thead>
                                        <tr>
                                            <th></th>
                                            <th>Current</th>
                                            <th>Actions</th>
                                            <th>Upkeep</th>
                                            <th>New</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td>Food</td>
                                            <td>{resources.food}</td>
                                            <td>{resourceChangeReport["food"]}</td>
                                            <td>{getUpkeepOf("food")}</td>
                                            <td>{resources.food + resourceChangeReport["food"] + getUpkeepOf("food")}</td>
                                        </tr>
                                        <tr>
                                            <td>Wood</td>
                                            <td>{resources.wood}</td>
                                            <td>{resourceChangeReport["wood"]}</td>
                                            <td>{getUpkeepOf("wood")}</td>
                                            <td>{resources.wood + resourceChangeReport["wood"] + getUpkeepOf("wood")}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            <div style={{marginTop: "20px"}}>
                                {villagers > 0 ?
                                <p><b>Allocate your meeples :)</b> <br/> <Meeples count={villagers}/></p> :
                                <button className="button-38 button-38-extra" disabled={villagers !== 0} onClick={() => {advanceTurn()}}>Advance turn</button>
                                }
                                <br/>
                            </div>
                        </div>
                    </div>
                    <h3 style={{marginTop: 0}}>Available Actions</h3>
                    <div style={{flex: "1 50vh", overflow: "scroll"}}>
                        
                        <div className="actions" style={{textAlign: "left"}}>
                    
                            {ACTIONS.map((action, index) => (
                                <div key={index} className="action">
                                <p>
                                    <h4 style={{margin: 0}}>{action.name}</h4>

                                    Available in {action.tileTypes.join(", ")} <br/>
                                    Per meeple: <span>{(Object.entries(action.resourceDelta).map(([k, v]) => {return ( (v > 0 ? "+" : "") + v.toString() + " " + k)})).join(", ")}</span><br/>

                                    <div>
                                        <Fact credits={credits} setCredits={setCredits}>
                                            {actionFlavorText[scenario_name][action.name]}
                                        </Fact>
                                    </div>
                                    </p>

                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <div style={{marginRight: "8px"}}>
                    <h3>Potential Societal Events</h3>
                    <div style={{overflow: "scroll", maxHeight: "75vh"}}>
                        {DEMANDS[scenario_name].map((demand, i) => {
                            let game = gameDict();
                            
                            let isActive = demand.activation.robot(game);
                            let isSatisfied = demand.satisfaction.robot(game);
                            let rewardText = <div>Result if met: {demand.reward.human}</div>;
                            let penaltyText = <div>Result if not met: {demand.penalty.human}</div>;
                            if (true) {

                            
                            return (
                                    <div className="card" key={demand.name}>
                                        <div style={{textAlign: "left", color: isActive ? "white" : "gray"}}>
                                            <b>{demand.name} {isSatisfied ? "[satisfied]" : ""}</b>
                                            <br/>
                                            <br/>

                                            {isActive ? "Enabled because " : "Will enable when "}{demand.activation.human}<br/>

                                            <p style={{color: isActive ? (isSatisfied ? "green" : "white") : "inherit"}}>
                                                {isSatisfied ? "You have met: " : "Will be met if "}{demand.satisfaction.human}<br/>
                                            </p>
                                            <br/>

                                            {(isActive && isSatisfied) ? <b>{rewardText}</b> : rewardText}
                                            {(isActive && !isSatisfied) ? <b>{penaltyText}</b> : penaltyText}
                                            {demand.allocateVillagersToMeet > 0 ? <div>
                                                {demandsAllocatedTo.includes(demand.name) ? 
                                                    <div>
                                                        <Meeples count={demand.allocateVillagersToMeet}/>
                                                        <button className="button-38" style={{marginRight: "6px"}} onClick={() => {setDemandsAllocatedTo(demandsAllocatedTo.filter((e) => e !== demand.name)); setVillagers(villagers + demand.allocateVillagersToMeet);}}>cancel</button>
                                                    </div>
                                                    : 
                                                    <button className="button-38" disabled={!isActive || villagers < demand.allocateVillagersToMeet} onClick={() => {demandsAllocatedTo.push(demand.name); setVillagers(villagers - demand.allocateVillagersToMeet);}}>Allocate <Meeples count={demand.allocateVillagersToMeet}/></button>
                                                }
                                            
                                            
                

                                            </div> : ""}

                                            <Fact credits={credits} setCredits={setCredits}>
                                                {demand.flavor}
                                            </Fact>

                                        </div>
                                    </div>)
                            } else {
                                return "";
                            }
                        })}
                        </div>
                </div>
            </div>
                
        </div>
    </div>
    );
};


export default ClimateGame;