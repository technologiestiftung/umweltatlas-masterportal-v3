const inquirer = require("inquirer"),
    buildFunctions = require("./buildFunctions");

const portalPath = process.env.PORTAL_PATH;

if (portalPath) {
    buildFunctions({ portalPath });
} else {
    const questions = [
        {
            type: "input",
            name: "portalPath",
            message: "Pfad zum Ordner mit Portalen ausgehend von \"[...]/masterportal/\":",
            default: "portal"
        }
    ];
    inquirer.prompt(questions).then(function (answers) {
        buildFunctions(answers);
    });
}
