import React, { useState } from 'react';



const TILE_TYPES = ['land', 'farmland', 'water'];
const WOOD = "wood";
const STONE = "stone";
const FOOD = "food";
const RESOURCES = ['wood', 'stone', 'food'];
const ACTIONS = [  { name: 'Gather resources', villagersRequired: 1, tileTypes: ['land', 'farmland'], resources: ['wood', 'stone'] },
{ name: 'Prepare land for farming', villagersRequired: 2, tileTypes: ['land'], resources: ['wood'] },
{ name: 'Farm prepared land', villagersRequired: 3, tileTypes: ['farmland'], resources: ['food'] },
];

class Tile{
    constructor(row, column, type){
        this.r = row;
        this.c = column;
        this.type = type
    }
}

const GRID_SIDE = 5;

const newDefaultTileGrid = () => {
    let grid = Array(GRID_SIDE).fill(Array(GRID_SIDE).fill(null));
    for (let i = 0; i < GRID_SIDE; i++){
        for (let j = 0; j < GRID_SIDE; j++){
            grid[i][j] = new Tile(i, j, TILE_TYPES[0]);
        }
    }
    return grid;
}

const iterateOver2dArray = (array2d) => {
    let result = []
    for (let i = 0; i < array2d.length; i++){
        for (let j = 0; j < array2d[i].length; j++){
            result.push(array2d[i][j]);
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

const handleTileClick = (index) => {
    const newGrid = [...grid];
    const tileType = TILE_TYPES[(TILE_TYPES.indexOf(newGrid[index]) + 1) % TILE_TYPES.length];
    newGrid[index] = tileType;
    setGrid(newGrid);
};

const handleActionClick = (action) => {
if (villagers < action.villagersRequired) {
    alert(`You need at least ${action.villagersRequired} villagers to perform this action.`);
    return;
}

const tileIndices = [];
for (let i = 0; i < grid.length; i++) {
    if (action.tileTypes.includes(grid[i])) {
    tileIndices.push(i);
    }
}

if (tileIndices.length === 0) {
    alert(`There are no tiles available for this action.`);
    return;
}

const index = tileIndices[Math.floor(Math.random() * tileIndices.length)];
const newGrid = [...grid];
switch (action.name) {
    case 'Gather resources':
    newGrid[index] = 'water';
    break;
    case 'Prepare land for farming':
    newGrid[index] = 'farmland';
    break;
    case 'Farm prepared land':
    newGrid[index] = 'land';
    break;
    default:
    break;
}
setGrid(newGrid);
setVillagers(villagers - action.villagersRequired);

const newResources = { ...resources };
for (let resource of action.resources) {
    newResources[resource] += 1;
}
setResources(newResources);
};

const handleVillagerAllocation = (action, amount) => {
if (action === 'add') {
    setVillagers(villagers + amount);
} else {
    setVillagers(villagers - amount);
}
};

return (
<div>
    <h2>Climate Game</h2>
    <p>Villagers remaining: {villagers}</p>
    <p>Wood: {resources.wood}</p>
    <p>Stone: {resources.stone}</p>
    <p>Food: {resources.food}</p>
    <div className="grid">
    {iterateOver2dArray(grid).map((tile, index) => (
        
        <div
            key={index}
            onClick={() => handleTileClick(index)}
            >a</div>
        
        ))}
    </div>

    <div className="actions">
        {ACTIONS.map((action, index) => (
            <div key={index}>
            <h3>{action.name}</h3>
            <p>Requires {action.villagersRequired} villagers</p>
            <p>Available on {action.tileTypes.join(', ')}</p>
            <p>Costs: {action.resources.join(', ')}</p>
            <button onClick={() => handleActionClick(action)}>Perform action</button>
            </div>
        ))}
        </div>
        <div className="villager-allocation">
        <h3>Villager allocation</h3>
        <button onClick={() => handleVillagerAllocation('add', 1)}>Add villager</button>
        <button onClick={() => handleVillagerAllocation('remove', 1)}>Remove villager</button>
        </div>
    </div>
    );
};

export default ClimateGame;