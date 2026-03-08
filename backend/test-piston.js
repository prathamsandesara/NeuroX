const pistonService = require('./src/services/pistonService');

async function test() {
    console.log("Testing Piston Service...");
    try {
        const outputJS = await pistonService.executeCode('javascript', 'console.log("Hello from Piston JS");');
        console.log("JS Output:", outputJS.trim());

        const outputPy = await pistonService.executeCode('python', 'print("Hello from Piston Python")');
        console.log("Python Output:", outputPy.trim());

        console.log("Test Passed!");
    } catch (err) {
        console.error("Test Failed:", err);
    }
}

test();
