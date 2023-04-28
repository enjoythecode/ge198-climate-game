import React, { useState } from 'react';
import meeple from "./assets/meeple.png";
import "./deck.css"

const TILE_TYPES = ['forest', 'farmland', 'water'];
const RESOURCE_TYPES = ["food", "wood"]

const ACTIONS = [
    { name: 'Gather resources', tileTypes: ['forest', 'farmland'], resourceDelta: {food: 5, wood: 1} },
    { name: 'Prepare land for farming', tileTypes: ['forest'] , resourceDelta: {wood: -2} },
    { name: 'Tend to farm', tileTypes: ['farmland'], resourceDelta: {food: 7}  },
    { name: 'Fish', tileTypes: ['water'], resourceDelta: {food: 6}  },
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

const newDefaultTileGrid = () => {
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
    return [...Array(count)].map((e, i) => <Meeple key={i}/>)
}

const Meeple = () => {
    return (
        <img src={meeple} style={{width:"30px"}} alt="Meeple icon representing a villager"></img>
    )
}

const Card = ({content}) => {
    return (
        <div className="card">{content === undefined ? "lorem ipsum card" : content}</div>
    )
}

const ClimateGame = () => {
    const [grid, setGrid] = useState(newDefaultTileGrid);
    const [villagers, setVillagers] = useState(5);
    const [turns, setTurn] = useState(1);
    const [resources, setResources] = useState({
    wood: 20,
    food: 20,
    });

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

                /*if (new_villagers_on_tile === 0) {
                    newGrid[tile.key].action = null;
                }*/
            }
        }

        setGrid(newGrid);
        
    };

    let resourceChangeReport = getResourceReportOfGrid(grid);

    return (
    <div style={{display:"flex", flexDirection:"row"}}>
        <div>
            <div className="tile-grid" style={{width: "1200px", height:"900px"}}>
            {iterateOverGridInRowOrder(grid).map((tile, index) => (
                
                <div className={"cell tile-type-" + tile.type}
                    key={index}
                >
                    
                    {tile.action !== null ? 
                        (<div>                    
                            {tile.action.name}

                            <br/>
                               
                            <button style={{marginRight: "6px"}} onClick={() => changeVillagerCountOnTile(tile, -1)}>{tile.villagers > 0 ? "-" : "cancel"}</button>
                            <Meeples count={tile.villagers}/>
                            <button style={{marginLeft: "6px"}} onClick={() => {changeVillagerCountOnTile(tile, +1); console.log(getResourceReportOfTile(tile))}}>+</button>
                        </div>)
                    :
                        (
                            <div className="actions">
                                {tile.getValidActions().map((action, index) => (
                                    <button disabled={villagers === 0} key={index} onClick={() => {
                                        let newGrid = {...grid};
                                        newGrid[tile.key].action = action;
                                        newGrid[tile.key].villagers = 1;
                                        setVillagers(villagers - 1);

                                        setGrid(newGrid);
                                    }}>
                                        {action.name}
                                    </button>
                                ))}
                            </div> 
                        )
                    }
                </div>
                ))}
            </div>
        </div>

        <div>

            <h1>Turn {turns}</h1>

            <p>Unallocated meeples</p><br/>
            <Meeples count={villagers}/>

            <table>
                <tr>
                    <th></th>
                    <th>Current</th>
                    <th>Actions</th>
                    <th>New</th>
                </tr>
                <tr>
                    <td>Food</td>
                    <td>{resources.food}</td>
                    <td>{resourceChangeReport["food"]}</td>
                    <td>{resources.food + resourceChangeReport["food"]}</td>
                </tr>
                <tr>
                    <td>Wood</td>
                    <td>{resources.wood}</td>
                    <td>{resourceChangeReport["wood"]}</td>
                    <td>{resources.wood + resourceChangeReport["wood"]}</td>
                </tr>
                
            </table>

            <h3>Available Actions</h3>
            <div className="actions" style={{textAlign: "left"}}>
                {ACTIONS.map((action, index) => (
                    <div key={index}>
                    
                    <p><b>{action.name}</b> {"["+ action.tileTypes.join('] [') + "]"}</p>
                    </div>
                ))}
                </div>
                <Card></Card>
            </div> 
        
           
        </div>
    );
};


export default ClimateGame;