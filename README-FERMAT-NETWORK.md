#Fermat Network Rendering

In this document, we describe how the Fermat.org site will render the Fermat Network. How the data flows from the server to browsers in order to produce the visualizations.

As the Fermat Network is a complex creature, many different views are going to be provided in order to navigate through this complexity.

## Basic Elements

Here is the list of the basic elements that conforms the diferents views explained in the next section. The list shows the hierarchy, meaning that one type of sprite contains its sub-levels.

### Sprite Categories

- **Network Nodes** : Denoted by a sprite for each type of node and the operating system. It's a niche where several Network Clients will connect and will work as intermediaries between each other. The type of nodes are: home computer, server, smart phone, tablet, etc. Operating systems might be: Windows, Linux, OSx, Android, etc.

    - **Network Clients** : Denoted as a sprite for each type of device and its operating system. Device type might be: smart phone, pc, tablet, etc. 

        - **Network Services** : Denoted with a sprite representing each type: Network Service or Actor Network Service. A Network Services connects with its counterpart in another device.
    
        - **Actors** : Denoted with a sprite for each Actor Type (Developer, Crypto Broker, etc). 

        - **Wallets** : Denoted with a sprite for each Wallet Type.

As it seems, there are several sprite categories, so there must be a way to identify each one.

### Types of Relationships

- **Connected to** : For example, a Network Client is _connected to_ a Network Node.

- **Running at** : For example, a Network Service is _running at_ a Network Client.

- **Living at** : For example, an Actor is _living at_ a Network Client.

- **Installed at** : For example, a Wallet is _installed at_ a Network Client.

- **Interconnected** : For example, an Actor is _interconnected_ with another Actor when one of them sent to the other a _connection request_ and the other party accepted it.

All relationships are rendered with lines, but depending on their category different techniques (arrow, dots, dashes, etc.) are applied to distinguish between each other. 

## View List

1. **Online Node Network** : This view provides a geo-localized view of online Nodes in the Fermat Network. **[What if geo-loc is disabled?]**

2. **Nodes and connected Network Clients** : In this view, a single Network Node is present, and all connected Network Clients are rendered.

3. **Node Catalog** : This is a geo-localized view of all nodes, both online and offline, present on the distributed Node Catalog **[What is a Node and Actor Catalog?]**.

4. **Actor Catalog** : This is a geo-localized view of all actors, both online and offline, present on the distributed Actor Catalog.

5. **Network Services** : This view shows all online network services online on one Network Client. When the Network Service is an Actor Network Service, it also shows the actors associated with each of them.

6. **Wallets** : This view show all wallets and their type linked to one Network Client. Each wallet shows its balance and currency. 

7. **Social Network** : This view shows the connections between Actors within the system. 

8. **Private Networks** : This view shows the private networks created by users **[Private network of what? Node Networks?]**.

## User Experience

In this section we describe what exactly is expected in each view.

### Online Network Nodes
 
This is the starting view, all Network Nodes will be drawn here in a geolocalized map. The geolocalized maps will be a plane mapamundi and having *country resolution*: all nodes in a country will be inside that country, but the state/providence won't be taken into account.

> [Discussion]

> Miguel: I'm against this idea, because having a geofenced network will restraint the available space for drawing, for example, if we had 100 nodes in every country, and we had 500 nodes in Japan -which is a small country- we won't be able to draw those 500 sprites in the simple view, and adding a big zoom (which will be rather a movement than a zoom) to see more nodes breaks the concept of *overview*

##The challenge

As the P2P is expected to be so large, and being updated and larger every time, it's not feasible
to obtain the whole P2P data in a single json document, so and ajax call is not possible because
it expects a complete json document to be received, and we need a continuous data traffic to 
render the network in real-time with the server.

##The solution 

##Server-side process

###Data structure
*To be completed...*

##Client-side process
