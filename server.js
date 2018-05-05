/***********************************************************************
*  NodeJS – Assignment 6
*  I declare that this assignment is my own work in accordance with  the Academic Honesty Policy.  
* 
*  No part of this assignment has been copied manually or electronically from any other source 
*
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name: Ehsan Ekbatani Date: DEC 19th, 2016
*
*  Online (Heroku) Link: https://rocky-lowlands-28189.herokuapp.com/
*
***********************************************************************/

var HTTP_PORT = process.env.PORT || 8080;
var path = require("path");
var path1 = require("./data-service.js");
var express = require("express");
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');
var dataServiceComments = require('./data-service-comments.js');
var app = express();

function onHttpStart(){
    console.log("Express http server listening on: " + HTTP_PORT);
}

app.use(express.static('public')); 

//assignment 4
app.use(bodyParser.urlencoded({ extended: true }));

app.engine(".hbs", exphbs({
  extname: ".hbs",
  defaultLayout: 'layout',
  helpers: {
    equal: function (lvalue, rvalue, options) {
      if (arguments.length < 3)
        throw new Error("Handlebars Helper equal needs 2 parameters");
      if (lvalue != rvalue) {
        return options.inverse(this);
      } else {
        return options.fn(this);
      }
    }
  }
}));
app.set("view engine", ".hbs");

// setup a 'route' to listen on the default url path
app.get("/", function(req, res) {
    res.render("home");
});

//A6 updated
app.get("/about", function(req,res){
    dataServiceComments.getAllComments().then(function(data){
        res.render("about", {data: data});
    }).catch(()=>{res.render("about");})
    
});

app.get('/employees', function(req, res) {
    
    if (req.query !== {} || req.query.manager !== {})
    { 
        if (req.query.status)
            
            path1.getEmployeesByStatus(req.query.status)
            .then( function(data) {
                res.render("employeeList", { data: data, title: "Employees" });;
            })
            .catch( function(err) {res.render("employeeList", { data: {}, title: "Employees" });});

        else if (req.query.department)
            
            path1.getEmployeesByDepartment(req.query.department)
            .then( function(data) {
                res.render("employeeList", { data: data, title: "Employees" }); 
            })
            .catch( function(err) {res.render("employeeList", { data: {}, title: "Employees" });});

        else if (req.query.manager)
            
            path1.getEmployeesByManager(req.query.manager)
            .then( function(data) {
                res.render("employeeList", { data: data, title: "Employees" }); 
            })
            .catch( function(err) {res.render("employeeList", { data: {}, title: "Employees" });});

        else if (req.query)
            path1.getAllEmployees().then( function(data) {
                res.render("employeeList", { data: data, title: "Employees" });     
            })
            .catch( function(err) {res.render("employeeList", { data: {}, title: "Employees" });});

        else 
            {
                res.render("employeeList", { data: {}, title: "Employees" });     
            }
            
    }    
});

app.get("/employee/:empNum", (req, res) => {
    
      // initialize an empty object to store the values
      let viewData = {};
    
      path1.getEmployeesByNum(req.params.empNum)
      .then((data) => {
        viewData.data = data; //store employee data in the "viewData" object as "data"
      }).catch(()=>{
        viewData.data = null; // set employee to null if there was an error 
      }).then(path1.getDepartments)
      .then((data) => {
        viewData.departments = data; // store department data in the "viewData" object as "departments"
        
          // loop through viewData.departments and once we have found the departmentId that matches
          // the employee's "department" value, add a "selected" property to the matching 
          // viewData.departments object
    
         for (let i = 0; i < viewData.departments.length; i++) {
            if (viewData.departments[i].departmentId == viewData.data.department) {
              viewData.departments[i].selected = true;
            }
          }
    
      }).catch(()=>{
        viewData.departments=[]; // set departments to empty if there was an error
      }).then(()=>{
          if(viewData.data == null){ // if no employee - return an error
              res.status(404).send("Employee Not Found");
          }else{
            res.render("employee", { viewData: viewData }); // render the "employee" view
          }
      });
    });
    

app.get('/managers', (req,res)=>{
    path1.getManagers()
    .then( function(data) {
        res.render("employeeList", { data: data, title: "Employees (Managers)" });    
        
    })
    .catch( function(err){res.render("employeeList", { data: {}, title: "Employees (Managers)" });});
});

app.get('/departments', (req,res)=>{
    path1.getDepartments()
    .then( function(data) {
        res.render("departmentList", { data: data, title: "Departments" });    
    })
    .catch( function(err) {res.render("departmentList", { data: {}, title: "Departments" });});
});
//Updated in A5
app.get("/employees/add", (req,res) => {
    path1.getDepartments().then((data)=>{
        res.render("addEmployee", {departments: data});
    }).catch(()=>{
        res.render("addEmployee", {departments: []}); 
    })
});

app.post("/employees/add", (req, res) => {
    path1.addEmployee(req.body).then(function(data){
        res.redirect("/employees");})
    
});
app.post("/employee/update", (req, res) => {
    path1.updateEmployee(req.body).then(function(data){
    res.redirect("/employees");});
});

//Routes for A5
app.get("/departments/add", (req,res) => {
    res.render("addDepartment");
});

app.post("/departments/add", (req, res) => {
    path1.addDepartment(req.body).then(function(data){
        res.redirect("/departments");})
    
});

app.post("/departments/update", (req, res) => {
    path1.updateDepartment(req.body).then(function(data){
    res.redirect("/departments");});
});

app.get('/department/:depNum', (req,res)=>{
    path1.getDepartmentById(req.params.depNum)
    .then( function(data){
        res.render("department", { data: data });})
    .catch(function(err) {res.status(404).send("Department Not Found");});
});

app.get('/employee/delete/:empNum', (req,res)=>{
    path1.deleteEmployeeByNum(req.params.empNum)
    .then(function(data){
        res.redirect("/employees");
    }).catch(function(err){res.status(500).send("Unable to Remove Employee / Employee Not Found")});
});

///end of A5 Routes
///A6 POSTS
app.post("/about/addComment", (req, res) => {
    dataServiceComments.addComment(req.body).then(function(){
        res.redirect("/about");}).catch(function(){
            console.log("addComment(data) failed.")
            res.redirect("/about");});
});

app.post("/about/addReply", (req, res) => {
    dataServiceComments.addReply(req.body).then(function(){
        res.redirect("/about");}).catch(function(){
            console.log("addReply(data) failed.")
            res.redirect("/about");});
});
//end of A6 POST
app.get('*', (req,res)=>{
    res.status(404);
    res.send("Page Not Found");
});
// setup http server to listen on HTTP_PORT
path1.initialize().then( function() {
    dataServiceComments.initialize();})
.then(function(){
    app.listen(HTTP_PORT, onHttpStart)})
    .catch( function (){
        console.log("unable to start dataService");
    });
