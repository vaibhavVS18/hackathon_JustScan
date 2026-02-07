import mongoose from "mongoose";
import connect from "../db/db.js";
import fs from "fs";

// Helper to log to file
const logToFile = (msg) => {
    fs.appendFileSync("script_log.txt", msg + "\n");
    console.log(msg);
};

logToFile("Script loaded. Starting execution at " + new Date().toISOString());

const dropIndex = async () => {
    try {
        logToFile("Connecting to DB...");
        await connect();
        logToFile("Connected to DB");
        
        const collection = mongoose.connection.collection('organizations');
        
        // List indexes to confirm it exists first
        const indexes = await collection.indexes();
        logToFile("Current indexes: " + JSON.stringify(indexes));

        const indexName = "slug_1";
        const indexExists = indexes.some(idx => idx.name === indexName);

        if (indexExists) {
            await collection.dropIndex(indexName);
            logToFile(`Index ${indexName} dropped successfully.`);
        } else {
            logToFile(`Index ${indexName} not found.`);
        }
    } catch (error) {
        logToFile("Error in dropIndex: " + (error.stack || error));
    } finally {
        logToFile("Closing connection...");
        await mongoose.disconnect();
        logToFile("Disconnected from DB");
        process.exit(0);
    }
};

dropIndex();
