#Fermat Network Rendering Description

In this document, we describe how the Fermat.org site will render the Fermat Network. How the data flows from the server to browsers in order to produce the visualizations.

As the Fermat Network is a complex creature, many different views are going to be provided in order to navigate through this complexity.

## View List

1. **Online Node Network** : This view provides a geo-localized view of online Nodes in the Fermat Network.
2. **Node and connected Network Clients"** : In this view, a single Network Node is present, and all connected Network Clients are rendered.
3. **Node Catalog** : This is a geo-localized view of all nodes, both online and offline, present on the distributed Node Calaog.
4. 


MIGUEL :ya te voy a completar la lista.



##P2P user experience
In this section we describe what exactly is expected in the P2P view.

In the P2P view, the user will enter in a free-moving space where he or she can see the nodes
that conforms it and lines interconecting them as they are in ther network.

The curren types of nodes are:
- *Network Nodes*: Denoted by a server sprite, it's a niche where several devices will connect and will
work as intermediaries between devices and other servers.
- *Network Clients*: Denoted as a smartphone sprite, it's a handset that connects to a server and
includes others nodes inside:
    - *Network Services*: Denoted with **[What?]**, it works as endpoints of connections
    between the devices, a Network Services connects with its counterpart in another
    device.
        - *Plug-in*: Denoted with a shuffle. The smallest component in the network(?)
    - *Actor Network Services*: Denoted with **[What?]**, it's a Network Service which is used
    by Actor-type plugins, whose act like entities.
        - *Actor Plug-in*: Denoted with a person sprite. Plug-ins that works as identities inside
        a device.

*(Who contains the wallet? The mobile device?)*
        
As it seems, there are several types of nodes, and a node can have child nodes which are in a sub-
network inside the parent node. So, for example, in the first view the user will see the servers and
mobile devices, if he or she clicks in a mobile devices everything else will flyout and he or she will
see the children Network Services inside that device. *Is this right?*

##The challenge
As the P2P is expected to be so large, and being updated and larger every time, it's not feasible
to obtain the whole P2P data in a single json document, so and ajax call is not possible because
it expects a complete json document to be received, and we need a continuous data traffic to 
render the network in real-time with the server.

##The solution (deprecated)
*This block is not useful anymore as it was said the client and server needed bidirectional
communication*

So, as a continuous data sending is necessary, we are talking about a *stream*.

Luckily, there is a web interface that can support the stream paradigm, the **Server-Sent Events**
which is described at the W3C (http://www.w3.org/TR/eventsource).

Basically what the client will do is something like:

```javascript
var source = new EventSource('updates.cgi');
source.onmessage = function (event) {
  alert(event.data);
};
```

Where `updates.cgi` script will send the data with the `text/event-stream` MIME type (the data is sent with UTF-8 encoding).

So, we are talking about query once and just respondt to the event everytime it's triggered. Just
to be sure, we will add to the request the header `Cache-Control: no-cache` to avoid any
caching mechanism.

##Server-side process(deprecated)
*This block is not useful anymore as it was said the client and server needed bidirectional
communication*

###`text/event-stream` structure
The basic structure of the message the server must send is:

```
id: [IDString]
data: [dataString0]
data: [dataString1]
...
data: [dataStringN]
[blank_line]
```

- Note that at the end of each line must be a line break.
- *dataString* is the actual data that must be sent from the server, the *data* field can be sent
multiple times, resulting that the client will have an array of all of them.
- *IDString* is a non-empty string which will work to diferenciate between sends. The server will
get the last ID sent in each request, so it's a way to control which client received what.

###Data structure
*To be completed...*

##Client-side process
