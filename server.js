const express = require('express');
const path = require('path');
const fileHandler = require('./modules/fileHandler');

const app = express();

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

// 1. DASHBOARD
app.get('/', async (req, res) => {
    try {
        const employees = await fileHandler.read();
        
        const totalEmployees = employees.length;
        const totalBasic = employees.reduce((sum, emp) => sum + Number(emp.salary), 0);
        const totalTax = totalBasic * 0.12;
        const totalNet = totalBasic - totalTax;
        const avgSalary = totalEmployees > 0 ? (totalBasic / totalEmployees) : 0;
        const departments = [...new Set(employees.map(emp => emp.department))].length;

        res.render('index', { 
            employees, 
            stats: { totalEmployees, totalBasic, totalTax, totalNet, avgSalary, departments } 
        });
    } catch (err) {
        res.status(500).send("Error loading dashboard.");
    }
});

// 2. ADD FORM
app.get('/add', (req, res) => res.render('add'));

// 3. CREATE
app.post('/add', async (req, res) => {
    const { name, department, salary } = req.body;
    const salaryNum = Number(salary);

    if (!name || name.trim() === "" || salaryNum < 0) {
        return res.status(400).send("Invalid input: Name and positive salary required.");
    }

    try {
        const employees = await fileHandler.read();
        employees.push({ id: Date.now(), name, department, salary: salaryNum });
        await fileHandler.write(employees);
        res.redirect('/');
    } catch (err) {
        res.status(500).send("Error saving employee.");
    }
});

// 4. DELETE
app.get('/delete/:id', async (req, res) => {
    try {
        let employees = await fileHandler.read();
        employees = employees.filter(emp => emp.id != req.params.id);
        await fileHandler.write(employees);
        res.redirect('/');
    } catch (err) {
        res.status(500).send("Error deleting employee.");
    }
});

// 5. EDIT FORM
app.get('/edit/:id', async (req, res) => {
    try {
        const employees = await fileHandler.read();
        const employee = employees.find(emp => emp.id == req.params.id);
        if (!employee) return res.redirect('/');
        res.render('edit', { employee });
    } catch (err) {
        res.status(500).send("Error finding employee.");
    }
});

app.post('/edit/:id', async (req, res) => {
    try {
        let employees = await fileHandler.read();
        const index = employees.findIndex(emp => emp.id == req.params.id);
        if (index !== -1) {
            employees[index] = {
                id: Number(req.params.id),
                name: req.body.name,
                department: req.body.department,
                salary: Number(req.body.salary)
            };
            await fileHandler.write(employees);
        }
        res.redirect('/');
    } catch (err) {
        res.status(500).send("Error updating employee.");
    }
});

app.listen(3000, () => console.log('Server running on http://localhost:3000'));