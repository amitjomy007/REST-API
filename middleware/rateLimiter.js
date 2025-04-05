const redis = require('redis');

const client = redis.createClient();

client.connect().catch(console.error);


const windowInseconds = 60; //rate limit window
const maxRequests = 3;

async function rateLimiter(req,res,next) {
    try{
        const ip = req.ip;
        const rediskey = `rate_limit:${ip}`;

        const currentCount = await client.get(rediskey);

        if(currentCount) {
            console.log(`in past 1 minute : ${parseInt(currentCount)}`)
            if(parseInt(currentCount)>=maxRequests){
                return res.status(429).send('Too many reqests da, slow down man');
            } else{
                await client.incr(rediskey);
            }
        } else {
            await client.set(rediskey,1,{EX: windowInseconds});
        }
        next();
    } catch(err){
            console.error('Rate limiter failed: ', err);
            next();
    }
}


module.exports = rateLimiter;