

## Pre-requisites

In order to be able to follow the steps of this tutorial, you will need the following:

- Lenses up and running. You can use our free [Lenses Box](https://lenses.io/box/) instance if necessary.
- An Internet connection that will help you get D3.js and create the sample project.


## The scenario

We are going to read live data from a Kafka topic using Lenses API and visualize
it using D3.js The name of the Kafka topic is `cc_payments`.

In this scenario, we are going to use a service account to communicate with Lenses.
If you want to learn about using a regular account, you can check `other blog post`.


## Creating the Service Account


## The implementation

This section will present the steps needed for implementing the described
scenario beginning from Lenses.


### How to get data from Lenses

As we are using a service account, we do not need to login to Lenses first.


The following JavaScript code is used for getting the data from Lenses.


In order to get data from Lenses, you will need to create a **WebSocket**
connection.


## The data format

In this section you will learn more about the format of the JSON records read
from Lenses using JavaScript.


Once you know the format of the data, you can easily choose the fields that
interest you and are going to be included in the visualization process.


### Visualizing Data

This section will show the JavaScript code used for visualizing the data. As
mentioned before, we are going to use the *D3.js* library for visualizing the
data.

### The final output

In this section we are going to see the generated visualization. Note that each
time you load the HTML file, you will get a different output as we are working
with dynamic data, that is data that changes over time.


## Presenting the files


### The `./src/index.html` file


### The `./src/scripts/index.js` file



## Next steps

Now that you know how to visualize live data from Kafka topics through Lenses
and D3.js, you should begin visualizing data from your own Kafka topics.



## Useful links

- [Lenses](https://lenses.io/)
- [D3.js](https://d3js.org/)
- [Lenses API](https://api.lenses.io/)
- [Lenses Box 5 min tour](https://lenses.io/box/)
