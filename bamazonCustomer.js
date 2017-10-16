var mysql = require('mysql');
var inquirer = require('inquirer');
var AsciiTable = require('ascii-table');

var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
  
    // Your username
    user: "root",
  
    // Your password
    password: "nicole90",
    database: "mybamazon_db"
  });
  
  connection.connect(function(err) {
    if (err) throw err;
    // console.log("connected as id " + connection.threadId);
    // readBamazonAInventory();
});

//This function displays all off the inventory
function readBamazonAInventory(){
    connection.query("SELECT * FROM productItems", function(err, result){
        if(err) throw err;
        console.log(result);
        connection.end();
    })
}

function chooseBamazonView(){
    inquirer.prompt([
        {
            type: "list",
            message: "Select Appropriate Bamazon View Portal:",
            choices: ["Customer View", "Manager View","Supervisor View", "Quit"],
            name: "chosenViewPortal"
        }
    ]).then(function(chosenPortal){
        if(chosenPortal.chosenViewPortal === "Customer View"){
            console.log("You have chosen the Customer Portal");
            customerPortal();
        } else if(chosenPortal.chosenViewPortal === "Manager View"){
            console.log("You have chosen the Manager Portal");
            managerPortal();
        } else if(chosenPortal.chosenViewPortal === "Supervisor View"){
            console.log("You have chosen the Supervisor View")
            // trackStoreProfitAndOverhead();
            // createProductSalesColumnAndPrintTable()
        } else if (chosenPortal.chosenViewPortal){
            console.log("Exit Bamazon application")
        }
    })
}

chooseBamazonView();

function customerPortal(){
    inquirer.prompt([
        {
            type: "list",
            message: "Would you like to:",
            choices: ["Browse Inventory", "Shop"],
            name: "customerPortalChoice"
        }
    ]).then(function(customerChoice){
        if(customerChoice.customerPortalChoice === "Browse Inventory"){
            listProductsAvailable();
        } else if(customerChoice.customerPortalChoice === "Shop"){
            shop();
        }
    })
}

//Function for customer to browse inventory
function listProductsAvailable(){
var table = new AsciiTable();
table.setHeading('ID', 'Product', 'Department Key', 'Price', 'Quantity');
    // var thisQuery = "SELECT product_id, product_name, fk_department_id, product_price, product_stock_quantity FROM productItems";
    connection.query(`SELECT product_id, product_name, department_name, product_price, product_stock_quantity FROM productItems LEFT JOIN departments ON department_id = fk_department_id`, function(err, result){
        if(err) throw err;
        // console.log(result);
        result.forEach((product) => {
            // console.log(product);
            // table.addRow(product.product_id);
            table.addRow(product.product_id, product.product_name, product.department_name, "$" + product.product_price, product.product_stock_quantity);
           
           })
        console.log(`${table.toString()}\n`);
    })
}

//FUNCTION FOR CUSTOMERS TO SHOP INVENTORY
function shop(){
    inquirer.prompt([
        {
            type: "input",
            message: "Please input the product id of the item you would like to buy",
            name: "productId"
        }, 
        {
            type:"input",
            message:"Please enter how many units of the product you would like to purchase",
            name: "unitsRequested"
        }
]).then(function(buyerChoice){
        var chosenProductId = buyerChoice.productId;
        var chosenUnitsRequested = buyerChoice.unitsRequested;
        printRequestedItem(chosenProductId, chosenUnitsRequested);
        determineSufficientStock(chosenProductId, chosenUnitsRequested);
        //This doesn't work
        // listProductsAvailable(updateSQLTable(chosenUnitsRequested, currentQuantity));
      })
} //End of SHOP function

// PRINT REQUESTED ITEM TO THE CONSOLE
function printRequestedItem(chosenProductId, chosenUnitsRequested){
    var query = connection.query("SELECT * FROM productItems WHERE product_id=?", [chosenProductId],
        function(err, results){
            if (err) throw err;
            console.log("Product ID: " + chosenProductId + "\nProduct Name: " + results[0].product_name +
            "\nPrice: " + results[0].product_price + "\nQuantity Available: " + results[0].product_stock_quantity + "\nQuantity Requested: " + chosenUnitsRequested);
        }
    )
}

//CHECK STOCK OF PRODUCT
function determineSufficientStock(chosenProductId, chosenUnitsRequested){
    var quantityQuery = `SELECT product_id, product_name, product_price, product_stock_quantity FROM productItems WHERE product_id = ${chosenProductId}`
    connection.query(quantityQuery, function(err, results){
        if (err) throw err;
        var currentQuantity = results[0].product_stock_quantity;
        var pricePerProduct = results[0].product_price;

        if(chosenUnitsRequested > currentQuantity){
            console.log("INSUFFICIENT QUANTITY -- UNABLE TO COMPLETE PURCHASE REQUEST");
            console.log("YOU WILL BE REROUTED TO SHOPPING PAGE AGAIN");
            //THE TIMEOUT DOESN'T WORK....
            setTimeout(shop(), 8000);
        } else if(chosenUnitsRequested <= currentQuantity){
            console.log("STOCK AVAILABLE --PROCESSING PURCHASE REQUEST...");
            //Update Quantity of Stock
            console.log("Bill of sale: ")
                var remainingProductInventory = currentQuantity - chosenUnitsRequested;
                    console.log("Remaining Stock Available: " + remainingProductInventory);
                    console.log("You would like to purchase: " + chosenUnitsRequested + " items");
                var totalCost = (chosenUnitsRequested * pricePerProduct);
                    console.log("Price per Item: " + pricePerProduct);
                    console.log("Total Cost: " + "$" + totalCost);

                //Call function to update the table
                recordSaleUpdateTable(chosenProductId, remainingProductInventory);
            }
    })
}

//RECORD SALE
function recordSaleUpdateTable(chosenProductId, remainingProductInventory){
    var updateQuantity = `UPDATE productItems SET product_stock_quantity = ${remainingProductInventory} WHERE product_id = ${chosenProductId}`
    connection.query(updateQuantity, function(err, results){
        if (err) throw err;
        console.log("Sale Processed - Thank You for shopping with Bamazon!")
    })
}

//MAIN MANAGER FUNCTIONS
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
            listProductsAvailable();
        } else if(managerChoice.managerPortalChoice === "View Low Inventory"){
            console.log("View product inventory with count less than 5");
            listLowInventory();
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
                if(addInventoryResponse.addInventory === "Yes, I would like to add more inventory"){
                    console.log("Function to add more inventory will go here");
                    addInventorytoExistingProducts();
                } else if(addInventoryResponse.addInventory === "No, Return me to main Manager Portal")
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
                if(addProductResponse.addInventory === "Yes, I would like to add a new product"){
                    console.log("Function to add a new product will go here");
                    addNewProductToInventory();
                } else if(addInventoryResponse.addInventory === "No, Return me to main Manager Portal")
                    setTimeout(managerPortal, 3500);                   
            })            
        }
    })
}

function listLowInventory(){
    var table = new AsciiTable();
    table.setHeading('ID', 'Product', 'Department Key', 'Price', 'Quantity');
        // var thisQuery = "SELECT product_id, product_name, fk_department_id, product_price, product_stock_quantity FROM productItems";
        connection.query(`SELECT product_id, product_name, department_name, product_price, product_stock_quantity FROM productItems LEFT JOIN departments ON department_id = fk_department_id WHERE product_stock_quantity <6`, function(err, result){
            if(err) throw err;
            // console.log(result);
            result.forEach((product ) => {
                // console.log(product);
                // table.addRow(product.product_id);
                table.addRow(product.product_id, product.product_name, product.department_name, "$" + product.product_price, product.product_stock_quantity);
               
               })
            console.log(`${table.toString()}\n`);
        })
    }

function addInventorytoExistingProducts(){
    inquirer.prompt([
        {
            type: "input",
            message: "Choose the id of the product you would like to update from the chart",
            name: "updateId"
        },
        {
            type: "input",
            message: "Enter the quantity to be added to the existing inventory",
            name: "quantityAdded"
        }
    ]).then(function(inventoryUpdate){
        // listProductsAvailable();
        var productIdM = inventoryUpdate.updateId;
        var quantityAddedM = inventoryUpdate.quantityAdded;

        //RUN ORIGINAL QUERY TO GET CURRENT PRODUCT QUANTITY
        var quantityQuery = `SELECT product_id, product_name, product_price, product_stock_quantity FROM productItems WHERE product_id = ${productIdM}`
        connection.query(quantityQuery, function(err, results){
            if (err) throw err;
            currentQuantity = results[0].product_stock_quantity;
            newProductQuantity = parseInt(currentQuantity) + parseInt(quantityAddedM);
            
        //RUN ANOTHER QUERY TO UPDATE TABLE
        var updateQuantity = `UPDATE productItems SET product_stock_quantity = ${newProductQuantity} WHERE product_id = ${productIdM}`
            connection.query(updateQuantity, function(err, results){
                if (err) throw err;                            
                console.log("Inventory Processed")
            })          
        })    
    })
}

function addNewProductToInventory(){
    inquirer.prompt([
        {
            type: "input",
            message: "Enter the product name",
            name: "productName"
        },
        {
            type:"list",
            message: "Select a department for the product (1 = Living Room, 2 = Kitchen, 3 = Bedroom, 4 = Bathroom",
            choices:[   "1",
                        "2",
                        "3",
                        "4" ],
            name: "departmentKey"   
        },
        {
            type: "input",
            message: "Enter the price of the product",
            name: "productPrice"
        },
        {
            type: "input",
            message: "Enter the starting quantity for the product",
            name: "productQuantity"
        }
    ]).then(function(productAddition){
        var createdPName = productAddition.productName;
        var createdPDepartment = productAddition.departmentKey;
        var createdPPrice = productAddition.productPrice;
        var createdPQuantity = productAddition.productQuantity;

        var newProduct = `INSERT INTO productItems (product_name, fk_department_id, product_price, product_stock_quantity) VALUES ('${createdPName}', '${createdPDepartment}', '${createdPPrice}', '${createdPQuantity}')`
        connection.query(newProduct, function(err, results){
            if (err) throw err;
            console.log(results.affectedRows);
            console.log("NEW PRODUCT ADDED TO THE INVENTORY");
        })
    })
}

//MAIN SUPERVISOR FUNCTIONS

//CREATE COLUMNS IN FOR STORE SALES TABLE
    //CREATE COLUMN FOR PRODUCT SALES on PRODUCTitems table
function createProductSalesColumnAndPrintTable(){
    //Grab total productItems table
    connection.query(`SELECT product_id, product_name, department_name, product_price, product_stock_quantity FROM productItems LEFT JOIN departments ON department_id = fk_department_id`, function(err, results){
        if(err) throw err;
        //Calculate total product sales
        var currentProductQuantity = results[0].product_stock_quantity;
        var pricePerProduct = results[0].product_price;
        var thisProductTotalSales = currentProductQuantity * pricePerProduct

    //Create a column for total product sales    
        connection.query(`ALTER TABLE productItems ADD product_sales INT (11)`, 
            function(err, result){
                if (err) throw err;
                connection.query(`INSERT INTO productItems (product_sales) VALUES ('${thisProductTotalSales}')`)
                // console.log(result);
            }
        )

    // //Print productItems table with new column in it
    var table = new AsciiTable();
    table.setHeading('ID', 'Product', 'Department Key', 'Price', 'Quantity', 'Total Item Sales');
        connection.query(`SELECT product_id, product_name, department_name, product_price, product_stock_quantity, product_sales FROM productItems LEFT JOIN departments ON department_id = fk_department_id`, function(err, result){
            if(err) throw err;
            // console.log(result);
            result.forEach((product) => {
                table.addRow(product.product_id, product.product_name, product.department_name, "$" + product.product_price, product.product_stock_quantity, product.product_sales);
               
               })
            console.log(`${table.toString()}\n`);
        })
    })
}
