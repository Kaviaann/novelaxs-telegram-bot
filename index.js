// Declare Variable
require('dotenv').config();
const fs = require('fs-extra');
const TelegramBot = require('node-telegram-bot-api');
const bot = new TelegramBot(process.env.BOT_TOKEN, { polling : true });
const path = './data/user.json'
const errorMsg = "Error";
let logged = false;


// Declare Function
makeUser();


// Console.log
bot.on('message', (msg) => {
    console.log(`@${msg.from.username}: ${msg.text}`);
})


// Start
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;

    bot.sendMessage(chatId, 'Selamat Datang!\n\nSilahkan Login Ke User Anda : \n\nFormat : \n/login [username] [userpass]');
})


// Login
bot.onText(/\/login (.+)/, (msg, match) => {
    const chatId = msg.chat.id;
    
    if(logged == true){

        bot.sendMessage(chatId, `You already logged in`);
    } else {
        const dataJson = fs.readFileSync(path);
        const data = JSON.parse(dataJson);

        if(data[chatId]){
            const username = match[1].slice(0,match[1].lastIndexOf('|')).trim();
            const pass = match[1].trim().slice(match[1].lastIndexOf('|')+1);
            let userLog = false;
            let passLog = false;

            if(username == data[chatId].username){
                userLog = true;
            }

            if(pass == data[chatId].password){
                passLog = true;
            }


            // Authentication
            if(userLog && passLog){
                logged = true;

                bot.sendMessage(chatId, `Successfully logged in user ${data[chatId].username}`);
            } else if(!userLog && passLog){
                passLog = true;
                userLog = false;

                bot.sendMessage(chatId, `${errorMsg} : \nYour username is invalid... do u want to remove or add user?\n\nFormat : \n/removeUser [y/n]\n/addUser [username] [password]`);
            } else if(userLog && !passLog){
                passLog = true;
                userLog = false;

                bot.sendMessage(chatId, `${errorMsg} : \nYour password is invalid... do u want to remove or add user?\n\nFormat : \n/removeUser [y/n]\n/addUser [username] [password]`);
            } else {
                passLog = false;
                userLog = false;

                bot.sendMessage(chatId, `${errorMsg} : \nYour username and password is invalid... do u want to remove or add user?\n\nFormat : \n/removeUser [y/n]\n/addUser [username] [password]`);
            }

        }

        else{

            bot.sendMessage(chatId, `${errorMsg} : \nU don't have any registered user, do you want to add it?\n\nFormat : \n/addUser [username] [password]`);
        }
    }
})


// Logout
bot.onText(/\/logout/, (msg) => {
    const chatId = msg.chat.id;

    if(logged == true){
        const dataJson = fs.readFileSync(path)
        const data = JSON.parse(dataJson);
        logged = false;
    
        bot.sendMessage(chatId, `You logged out from user : ${data[chatId].username}`)
    }

    else {

        bot.sendMessage(chatId, `You didn't logged in.. `);
    }
})


// Add User
bot.onText(/\/addUser (.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const username = match[1].slice(0, match[1].lastIndexOf('|')).trim();
    const password = match[1].trim().slice(match[1].lastIndexOf('|') + 1);
    const dataJson = fs.readFileSync(path);
    const data = JSON.parse(dataJson);

    if (!data[chatId]) {
        data[chatId] = {
            username,
            password
        };

        console.log(data);
        fs.writeFileSync(path, JSON.stringify(data, null, 2), 'utf-8');
    
        await bot.sendMessage(chatId, `Succesfully created new user with username : ${username}`);
        await bot.sendMessage(chatId, `Logged in`);
        logged = true;
    } else {
        bot.sendMessage(chatId, `You already have registered as: ${data[chatId].username}\n\nDo You Want To Remove It?\n/removeUser [y/n]`);
    }
});


// User information
bot.onText(/\/userInfo/, (msg) => {
    const chatId = msg.chat.id;
    const dataJson = fs.readFileSync(path);
    const data = JSON.parse(dataJson);
    
    if(data[chatId]){
        if(logged == true){
            const dataJson = fs.readFileSync(path);
            const data = JSON.parse(dataJson, 'utf-8');
            const username = data[chatId].username;
            const pass = data[chatId].password;
            bot.sendMessage(chatId, `User @${msg.from.username} Info :\n\nUsername : ${username}\nPassword : ${pass}`)
        } else {
            bot.sendMessage(chatId, `${errorMsg} : \nU Need To Login First Or Make User\n\nFormat :\n/login [username] [password]   (Login To User)\n/addUser [username] [password]     (Make User)`)
        }
    } 

    else {
        
        bot.sendMessage(chatId, `${errorMsg} : \n\nU doesn't have any user registered... do u want to add user?\n\nFormat : \n/addUser username|password`);
    }

})


// Remove user
bot.onText(/\/removeUser (.+)/, (msg, match) => {
    const chatId = msg.chat.id;
    const dataJson = fs.readFileSync(path);
    const data = JSON.parse(dataJson, 'utf-8');

    if(data[chatId]){
        if (match[1] == 'y') {
            // Delete user data for the specified chatId
            if(data[chatId]){
                delete data[chatId];
                
                // Save the updated data back to the file
                fs.writeFileSync(path, JSON.stringify(data, null, 2), 'utf-8');
        
                bot.sendMessage(chatId, `User data for user ${msg.from.username} has been removed.`);
            }
    
            else{
                bot.sendMessage(chatId, `${errorMsg} : \nYou don't have registered`)
            }
        } else if (match[1] == 'n') {
            bot.sendMessage(chatId, `User data removal canceled.`);
        } else if (!match[1]) {
            console.log(match);
        } else {
            bot.sendMessage(chatId, `${errorMsg} : \nFormat : /removeUser [y/n]`);
        }
    }

    else{

        bot.sendMessage(chatId, `${errorMsg} : \n\nU doesn't have any user registered... do u want to add user?\n\nFormat : \n/addUser username|password`);
    }
});





// Extra Function






// function
function makeUser() {

    if(!fs.pathExistsSync(path)){
        fs.mkdirSync(path.slice(0, path.lastIndexOf('/')), {recursive:true});
        fs.writeFileSync(path, JSON.stringify({}, null, 2), 'utf-8');
    }
}