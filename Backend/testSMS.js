import dotenv from "dotenv";
import { sendSMS } from "./utils/smsService.js";

dotenv.config();

const testPhone = "0777904783"; // Change to your actual number for testing
const testMessage = "Test Message from Bus Booking System";

console.log("--- Starting SMS Test ---");
sendSMS(testPhone, testMessage).then(success => {
    console.log("--- SMS Test Finished ---");
    console.log("Result:", success ? "SUCCESS" : "FAILED");
    process.exit(success ? 0 : 1);
});
