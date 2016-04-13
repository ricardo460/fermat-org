# Fermat Network Rendering

In this document, we describe how the Fermat.org site will render the Fermat Network. How the
data flows from the server to browsers in order to produce the visualizations.

The Fermat Network is a complex creature, many different views are going to be provided
in order to navigate through this complexity.

## Basic Elements

Here is the list of the basic elements that shape the different views explained in the next
section. The list shows the hierarchy, meaning that one type of sprite, contains sub-levels.

### Sprite Categories

- **Network Nodes** : Denoted by a sprite for each type of node and the operating system. It's a
niche where several Client Networks will connect and will work as intermediaries between
each other. The type of nodes are: home computer, server, smart phone, tablet, etc.
Operating systems might be: Windows, Linux, OSx, Android, etc.

    - **Network Clients** : Denoted as a sprite for each type of device and its operating system.
    Device type might be: smart phone, pc, tablet, etc. 

        - **Network Services** : Denoted with a sprite representing each type: Network
        Service or Actor Network Service. A Network Services connects with its counterpart
        in another device.
    
        - **Actors** : Denoted with a sprite for each Actor Type (Developer, Crypto Broker,
        etc). 

        - **Wallets** : Denoted with a sprite for each Wallet Type.

As it seems, there are several sprite categories, so there must be a way to identify each one.

### Types of Relationships

- **Connected to** : For example, a Network Client is _connected to_ a Network Node.

- **Running at** : For example, a Network Service is _running at_ a Network Client.

- **Living at** : For example, an Actor is _living at_ a Network Client.

- **Installed at** : For example, a Wallet is _installed at_ a Network Client.

- **Interconnected** : For example, an Actor is _interconnected_ with another Actor when one of
them sends to the other a _connection request_ and the other party accepts it.

All relationships are rendered with lines, but depending on their category, different techniques
(arrow, dots, dashes, etc.) are applied to distinguish between each other. 

## View List and user experience

### 1. Online Node Network
This view provides a geo-localized view of online Nodes in the
Fermat Network. **[What if geo-loc is disabled?]**

This is the starting view, all Network Nodes will be drawn here in a map. The geolocalized maps
will be a plane mapamundi and having *country resolution*: all nodes in a country will be inside that
country, but the state/city won't be taken into account.

If the user clicks in a Network Node, the map will fade out while this node goes to the center
position of the screen and will enter in the (2) view.

> [Discussion]

> Miguel: I'm against the geo-loc idea, because having a geofenced network will restraint the available space for drawing, for example, if we had 100 nodes in every country, and we had 500 nodes in Japan -which is a small country- we won't be able to draw those 500 sprites in the simple view, and adding a big zoom (which will be rather a movement than a zoom) to see more nodes breaks the concept of *overview*.
    

### 2. Nodes and connected Client Networks

In this view, a single Network Node is present, and all connected Network Clients are rendered.
The host Network Node will be the center of this sub-network, it will be at the center of the screen
with all the Network Clients around it as a star network topology.

When the user clicks in a Network Client, all the nodes disconnect and fly away, then comes all
the network services related to that client, reaching the (5) view.

### 3. Node Catalog

This is a geo-localized view of all nodes, both online and offline, present on
the distributed Node Catalog **[What is a Node and Actor Catalog?]**.

### 4. Actor Catalog

This is a geo-localized view of all actors, both online and offline, present on
the distributed Actor Catalog.

### 5. Network Services

This view shows all online network services online on one Network
Client. When the Network Service is an Actor Network Service, it also shows the actors
associated with each of them.

### 6. Wallets

This view shows all wallets and their type linked to one Client Network. Each wallet
shows its balance and
currency. 

### 7. Social Network

This view shows the connections between Actors within the system. 

### 8. Private Networks

This view shows the private networks created by users **[Private
networks of what? Node Networks?]**.

## Overall navigation map

| View  | Action                   | Target|
| :---: | ---                      | :---: |
| (1)   | Click in a Node          | (2)   |
| (2)   | Click in a Node Client   | (5)   |
| (2)   | _To be defined_          | (6)   |


## The challenge

As the P2P is expected to be so large, and being updated and larger every time, it's not feasible
to obtain the whole P2P data in a single json document, so a single ajax call is not possible
because it expects a complete json document to be received, and we need a continuous data
traffic to render the network in real-time with the server.

## The solution

To maintain a bidirectional communication between client and server, we are going to use
websockets (https://html.spec.whatwg.org/multipage/comms.html#network)

> Miguel: If the data about the P2P network is considered sensitive then there must be a
security layer in the data transfer to encrypt the transmission.

## Server-side process

### Data structure

The most common structure of data that must be sent for every node should be as follows:

```javascript
{
    id : ID_STRING,
    type : ("server" | "client" | "service" | "actor" | "wallet")
    ady : [
        //array of the adjacencies
        {
            id : ID_STRING,
            sub : ("living" | "connected" | "running" | "installed" | "interconnected")
        }
        //...
    ]
}
```

For each type the structure will change adding other properties:

- For `type = "server"`:

    ```javascript
        hardware : ("desktop" | "laptop" | "server" | "phone" | ...),
        os : ("windows" | "linux" | "osx" | "android" | ...)
    ```
    
    Furthermore, the adjacencies here uses more data to describe the connections, as connections
    between clients is made through network nodes and comes from its Network Services that lies
    inside such client to its counterpart in the other side, so the adjacencies use this extra
    data:
    
    ```javascript
        from : NSERVICE_ID_STRING
    ```

- For `type = "client"`:

    ```javascript
        hardware : ("desktop" | "laptop" | "server" | "phone" | ...),
        os : ("windows" | "linux" | "osx" | "android" | ...)
    ```
    
- For `type = "service"`:

    ```javascript
        sub : NETWORK_SERVICE_TYPE_STRING
    ```

- For `type = "actor"`:

    ```javascript
        sub : ACTOR_TYPE_STRING
    ```
    
- For `type = "wallet"`:

    ```javascript
        currency : CURRENCY_NUMBER,
        symbol : CURR_SYMBOL_STRING
    ```
## Client-side process
