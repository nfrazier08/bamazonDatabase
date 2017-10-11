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
        } else if(chosenPortal.chosenViewPortal === "Supervisor View"){
            console.log("You have chosen the Supervisor View")
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
        currentQuantity = results[0].product_stock_quantity;
        if(chosenUnitsRequested > currentQuantity){
            console.log("INSUFFICIENT QUANTITY -- UNABLE TO COMPLETE PURCHASE REQUEST");
        } else if(chosenUnitsRequested <= currentQuantity){
            console.log("STOCK AVAILABLE --PROCESSING PURCHASE REQUEST...");
        }
    })
}
    

  
