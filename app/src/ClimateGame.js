import React, { useState } from 'react';

const TILE_TYPES = ['land', 'farmland', 'water'];

const ACTIONS = [
    { name: 'Gather resources', tileTypes: ['land', 'farmland'], resourceDelta: {food: 5, wood: 1} },
    { name: 'Prepare land for farming', tileTypes: ['land'] , resourceDelta: {wood: -2} },
    { name: 'Farm prepared land', tileTypes: ['farmland'], resourceDelta: {food: 7}  },
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
            grid[i2k(i, j)] = new Tile(i2k(i, j), i, j, TILE_TYPES[0]);
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
    for(let key in grid){
        let tile = grid[key];
        let tile_report = getResourceReportOfTile(tile);
        for(let tile_resource in tile_report) {
            if(!(tile_resource in report)){report[tile_resource] = 0;}
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

const ClimateGame = () => {
    const [grid, setGrid] = useState(newDefaultTileGrid);
    const [villagers, setVillagers] = useState(5);
    const [resources, setResources] = useState({
    wood: 0,
    stone: 0,
    food: 0,
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

    

    return (
    <div>
        <h2>Climate Game</h2>

        {Object.entries(getResourceReportOfGrid(grid)).map(([key, value]) => {
            return (<p key={key}>{key}: {value}</p>)
        })}

        <div className="grid" style={{width: "1000px", height:"700px"}}>
        {iterateOverGridInRowOrder(grid).map((tile, index) => (
            
            <div className="cell"
                style={{display: "inline-block", width: "20%", height: "20%"}}
                key={index}
            >
                
                {tile.type} [{tile.villagers}] [{tile.action === null ? "t" : "f"}]
                
                {tile.action !== null ? 
                    (<div>{tile.action.name}:
                            <p onClick={() => {changeVillagerCountOnTile(tile, +1); console.log(getResourceReportOfTile(tile))}}>+</p>
                            <p onClick={() => changeVillagerCountOnTile(tile, -1)}>{tile.villagers > 0 ? "-" : "cancel"}</p>
                    </div>)
                :
                    (
                        <div className="actions">
                            {tile.getValidActions().map((action, index) => (
                                <button key={index} onClick={() => {
                                    console.log(action);
                                    let newGrid = {...grid};
                                    newGrid[tile.key].action = action;
                                    setGrid(newGrid);
                                }

                                  }>
                                    {action.name}.{tile.action===null}
                                </button>
                            ))}
                        </div> 
                    )
                }

            </div>
            
            ))}
        </div>

        <p>Villagers remaining: {villagers}</p>
        <p>Wood: {resources.wood}</p>
        <p>Stone: {resources.stone}</p>
        <p>Food: {resources.food}</p>

       

        <div className="actions">
            {ACTIONS.map((action, index) => (
                <div key={index}>
                <h3>{action.name}</h3>
                <p>Available on {action.tileTypes.join(', ')}</p>
                </div>
            ))}
            </div>
        </div> 
    );
};

export default ClimateGame;