//node Price_Tracking.js --email="" --pw="" --receiver=""
const puppeteer = require("puppeteer");
const cheerio = require("cheerio");
const cron = require('node-cron');
const nodemailer = require("nodemailer");
let minimist = require("minimist");
const upperCost = 900;
let arg = minimist(process.argv);
const url = "https://www.amazon.in/gp/product/B09G74BPQG";

async function browserLaunch()
{ 
     const browserOpen = await puppeteer.launch(
    {  
       headless: false,
       defaultViewport: null,
       args: ['--start-maximized']
    });
     let browserPages = await browserOpen.pages();
     let page = browserPages[0];
     await page.goto(url);
     return page;
}
async function sendMail(cost){
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: arg.email,
          pass: arg.pw,
        }
      });
        await transporter.sendMail({
        from: arg.email, 
        to: arg.reciever. 
        subject: "Amazon Tokyo Revengers Cost", 
        text: `Price dropped to ₹${cost}`,  
        html: `<a href=${url}>Tokyo Manji</a>`,  
      });
}
async function priceCheck(page)
{
    try{
        await page.reload();
        let html = await page.evaluate(()=>document.body.innerHTML);
        const $ = cheerio.load(html);
        let price = $("#priceblock_ourprice").text();
        price = price.replace("₹","")
        if(price<upperCost)
        {
            console.log("Buy it!!! Now it's cost is ₹"+price+" only.");
            await sendMail(price);
            return true;
        }
        else{
            return false;
        }
    }
    catch(err){
        console.log(err);
    }
}
async function monitor(){
    let page = await browserLaunch();
    await priceCheck(page)
    let task = cron.schedule('*/30 * * * *', () => {
        priceCheck(page)   
      });
      task.start();
    
}
monitor();
