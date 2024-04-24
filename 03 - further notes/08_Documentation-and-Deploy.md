# Documentation and Deployment notes

# 1. Documentation With Postman & Docgen
## Publishing postman documentation
  - duplicated the postman environment for production
    - changed URL to `http://devcamper.io` (this is optional, needs to be changed to proper url of hosting)
  - published the documentation

## Exporting the documentation
- used export option next to the collecion name in postman
  - exported as `Collection v2.1` and saved to desktop

## Generate HTML from documentation files
- To generated HTML from this we use a tool called `DocGen`
  - [DocGen](https://github.com/thedevsaddam/docgen)
  - install using instructions on the github page (use the terminal)

- to generate the documentation
``` console desktop
docgen build -i devcamper/dc.postman_collection.json -o index.html
```
  - this generated a index.html file 
  - we then copy this into `devcamper_api/public`
  - now on `localhost:5000` we get the api documentation
  
  ## Fixing jquery inline code
  - due to protection this is not allowed, required an import of the jquery in the head instead.
  - unminimize the index.html at [unminify2.com](https://www.unminify2.com/)
  - modify the head of index.html to this
  ``` HTML 
  <!doctype html><html lang=en><meta charset=utf-8><meta http-equiv=x-ua-compatible content="ie=edge"><meta name=viewport content="width=device-width,initial-scale=1"><title>DevCamper API
  &nbsp;|&nbsp;
  Backend API for the DecCamper application to manage bootcamps, courses, reviews, users and authentication.</title><script src="script.js" defer></script>
  ```
  - then copy the code from `<script>~~code here~~</script>` that sits above the footer (contains the jquery)
    - paste it into a `script.js` file, this is the file that gets imported in the head
    