// const http = require("http")
// const fs = require("fs/promises")

// class Butter{
//     constructor(){
//         // this in this.server refers to the instance
//         // of the HTTP server created by
//         // http.createServer().
//         // The this keyword here points to the current
//         // instance of the Butter class. As such I
//         // don't need to write server = http.createServer() again in the
//         // server.js, it is already handled in the constructor 
//         this.server = http.createServer();

//         this.routes = {}
//         this.middleware = []

//         this.server.on("request", (req, res)=>{
//             res.sendFile = async(path, mime)=>{
//                 const fileHandle = await fs.open(path, "r")
//                 const fileStream = fileHandle.createReadStream()

//                 res.setHeader("Content-Type", mime)

//                 fileStream.pipe(res)
//             }

//             res.status = (code)=>{
//                 res.statusCode = code
//                 return res;
//             }

//             res.json = (data) =>{
//                 res.setHeader("Content-Type", "application/json")
//                 res.end(JSON.stringify(data))
//             }

//             // this.middleware[0](req, res, ()=>{
//             //     this.middleware[1](req,res, ()=>{
//             //         this.middleware[2](req, res, ()=>{
//             //             this.routes[req.method.toLowerCase() + req.url](req, res)
//             //         })
//             //     })
//             // })

//             const runMiddleWare = (req, res, middleware, index)=>{
//             if(index === middleware.length){
//                 if(!this.routes[req.method.toLowerCase() + req.url]){
//                     return res.status(404).json({error: `Cannot ${req.method} ${req.url}`})
//                 }
//                 this.routes[req.method.toLowerCase() + req.url](req, res)
//             }else {
//                 middleware[index](req, res, ()=>{
//                     runMiddleWare(req, res, middleware, index + 1)
//                 })
//             }
//         }
//         runMiddleWare(req, res, this.middleware, 0)
//         })
//     }

//     route(method, path, cb){
//         this.routes[method + path] = cb;
//     }

//     beforeEach(cb){
//         this.middleware.push(cb);
//     }

//     listen = (port, cb) =>{
//         this.server.listen(port, ()=>{
//             cb()
//         })
//     }
// }

// module.exports = Butter;

const http = require("http")
const fs = require("fs/promises")

class Butter{
    constructor(){
        this.server = http.createServer();
        this.routes = {}
        this.middleware = []

        this.server.on("request", (req, res)=>{
            res.sendFile = async(path, mime)=>{
                const fileHandle = await fs.open(path, "r")
                const fileStream = fileHandle.createReadStream()
                res.setHeader("Content-Type", mime)
                fileStream.pipe(res)
            }

            res.status = (code)=>{
                res.statusCode = code
                return res;
            }

            res.json = (data) =>{
                res.setHeader("Content-Type", "application/json")
                res.end(JSON.stringify(data))
            }

            const runMiddleWare = (req, res, middleware, index)=>{
                if(index === middleware.length){
                    // Find matching route with parameter support
                    const matchedRoute = this.findMatchingRoute(req.method.toLowerCase(), req.url);
                    
                    if(!matchedRoute){
                        return res.status(404).json({error: `Cannot ${req.method} ${req.url}`})
                    }
                    
                    // Add params to request object
                    req.params = matchedRoute.params;
                    
                    // Call the route handler
                    matchedRoute.handler(req, res);
                } else {
                    middleware[index](req, res, ()=>{
                        runMiddleWare(req, res, middleware, index + 1)
                    })
                }
            }
            runMiddleWare(req, res, this.middleware, 0)
        })
    }

    // New method to find matching routes with parameter support
    findMatchingRoute(method, url) {
        const routeKey = method + url;
        
        // First try exact match (for routes without parameters)
        if (this.routes[routeKey]) {
            return { handler: this.routes[routeKey], params: {} };
        }
        
        // Then try pattern matching for parameterized routes
        for (const [pattern, handler] of Object.entries(this.routes)) {
            if (!pattern.startsWith(method)) continue;
            
            const routePath = pattern.substring(method.length); // Remove method prefix
            const match = this.matchRoute(routePath, url);
            
            if (match) {
                return { handler, params: match };
            }
        }
        
        return null;
    }

    // Method to match route patterns with URL parameters
    matchRoute(pattern, url) {
        const patternParts = pattern.split('/');
        const urlParts = url.split('/');
        
        if (patternParts.length !== urlParts.length) {
            return null;
        }
        
        const params = {};
        
        for (let i = 0; i < patternParts.length; i++) {
            const patternPart = patternParts[i];
            const urlPart = urlParts[i];
            
            if (patternPart.startsWith(':')) {
                // This is a parameter
                const paramName = patternPart.substring(1);
                params[paramName] = urlPart;
            } else if (patternPart !== urlPart) {
                // Static parts must match exactly
                return null;
            }
        }
        
        return params;
    }

    route(method, path, cb){
        this.routes[method + path] = cb;
    }

    beforeEach(cb){
        this.middleware.push(cb);
    }

    listen = (port, cb) =>{
        this.server.listen(port, ()=>{
            cb()
        })
    }
}

module.exports = Butter;