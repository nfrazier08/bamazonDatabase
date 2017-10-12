var mysql = require('mysql');
var inquirer = require('inquirer');
var AsciiTable = require('ascii-table');
console.log("Manager File Loaded");

function managerPortal(){
    inquirer.prompt([
        {
        type: "list",
        message: "Would you like to: ", 
        choices: ["View Products for Sale",
                  "View Low Inventory",
                  "Add to Inventory",
                  "Add New Product"
                 ], 
        name: "managerPortalChoice"
        }
    ]).then(function(managerChoice){
        if(managerChoice.managerPortalChoice === "View Products for Sale"){
            console.log("You would like to see all products for sale");
        } else if(managerChoice.managerPortalChoice === "View Low Inventory"){
            console.log("View product inventory with count less than 5");
        } else if (managerChoice.managerPortalChoice === "Add to Inventory"){
            inquirer.prompt([
                {
                    type: "list",
                    message: "Would you like to add more inventory?",
                    choices: [
                                "Yes, I would like to add more inventory",
                                "No, Return me to main Manager Portal"
                            ],
                    name: "addInventory"
                }
            ]).then(function(addInventoryResponse){
                if(addInventoryResponse === "Yes, I would like to add more inventory"){
                    console.log("Function to add more inventory will go here")
                } else if(addInventoryResponse === "No, Return me to main Manager Portal")
                    setTimeout(managerPortal, 3500);                    
            })
        } else if(managerChoice.managerPortalChoice === "Add New Product"){
            inquirer.prompt([
                {
                    type: "list",
                    message: "Would you like to add a new product?",
                    choices: [
                                "Yes, I would like to add a new product",
                                "No, Return me to main Manager Portal"
                            ],
                    name: "addInventory"
                }
            ]).then(function(addProductResponse){
                if(addProductResponse === "Yes, I would like to add a new product"){
                    console.log("Function to add a new product will go here")
                } else if(addInventoryResponse === "No, Return me to main Manager Portal")
                    setTimeout(managerPortal, 3500);                   
            })            
        }
    })
}


// module.exports = managerPortal;