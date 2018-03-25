# GoNorth

GoNorth is a web application used for planning the story and world of RPGs or other open world games. GoNorth is cross-plattform ready, provides multilanguage support and is designed as a responsive layout. 

It offers modules for:
 * Timeline view to provide a quick overview of changes
 * Planning Chapters as a Node System of Quests
 * Planning Quests as a Node System of Tasks
 * Planning Npcs and their different values
 * Planning dialogs of Npcs as Node System of dialog branches
 * Planning Items and their different values
 * Wiki component with tight integration into the other modules
 * Map component to position Quest marker, Npcs, Items, Wiki pages and map changes
 * Tracking your implementation status and showing changed values after change to already implemented object
 * Simple Task Tracker

## Deployment
![Badge](https://leif-dev.visualstudio.com/_apis/public/build/definitions/31ab5f65-48ba-4e5b-a93d-590ba3af9850/2/badge)

Please refer to the [wiki for deployment details](https://github.com/steffendx/GoNorth/wiki/Deployment) and the [official documentation on how to host and deploy an ASP.NET Core application](https://docs.microsoft.com/en-us/aspnet/core/host-and-deploy/?tabs=aspnetcore2x).

## Brief Overview

### Chapter and Quest Planning (Aika)
GoNorth provides a module for planning the different chapters of your game and the branching story.
For this it provides a node system which allows you to connect the different quests and their possible outcomes together:

![Chapter planning](https://github.com/steffendx/GoNorth/blob/master/TeaserImages/Aika.PNG?raw=true)

A similiar node system can be created for the different quests.  
Each quest will show the connections to Maps, Wiki pages and other objects to provide a view on the big picture while planning the quest.  
More details can be found [in the wiki](https://github.com/steffendx/GoNorth/wiki/Aika).

### Npc, Item and Skill Planning (Kortisto, Styr and Evne)
The web application provides functionality for planning Npcs, Items and Skills with flexible values. You can create templates and then create new Npcs, Items and Skills based on these templates:

![Npc planning](https://github.com/steffendx/GoNorth/blob/master/TeaserImages/Kortisto.PNG?raw=true)

Each object will display the different maps in which the Npc or Item is marked, the Wiki Pages in which its mentioned and all other connections. This way the user has a good overview what he or she has to consider when building the character or item.  
More details can be found in the wiki for [npcs](https://github.com/steffendx/GoNorth/wiki/Kortisto), [items](https://github.com/steffendx/GoNorth/wiki/Styr) and [skills](https://github.com/steffendx/GoNorth/wiki/Evne).

### Dialog Planning (Tale)
Using the dialog planning module a user can create the branching dialogs for the different game characters as a node system:

![Dialog planning](https://github.com/steffendx/GoNorth/blob/master/TeaserImages/Tale.PNG?raw=true)

GoNorth provides different dialog nodes for player or npc lines, player choices, conditions or actions.  
It is planned to implement a script export for these node systems.  
More details can be found [in the wiki](https://github.com/steffendx/GoNorth/wiki/Tale).

### Wiki Component (Kirja)
Kirja is the wiki component of GoNorth. Apart from allowing the user to write wiki pages it also features a tight integration into the other systems:

![Wiki](https://github.com/steffendx/GoNorth/blob/master/TeaserImages/Kirja.PNG?raw=true)

Kirja also allows the users to attach additional planning files.  
More details can be found [in the wiki](https://github.com/steffendx/GoNorth/wiki/Kirja).

### Map Planning (Karta)
A user can upload a high resolution map image to GoNorth which will then be transformed into an interactive map similiar to Google Maps. On this map a user can mark the position of Quest Markers, Npcs, Items, Wiki Pages and Map Changes:

![Map planning](https://github.com/steffendx/GoNorth/blob/master/TeaserImages/Karta.PNG?raw=true)

Each marker provides brief informations about the different objects and allow the users to jump of the detail page.  
A user can add addtional geometry like rectangles or polygons to a marker to indicate the affected area of the marker.
More details can be found [in the wiki](https://github.com/steffendx/GoNorth/wiki/Karta).

## Implementation Status Tracking
GoNorth allows you to mark objects as implemented once they are integrated into your game. If a user changes relevant values of theses objects afterwards GoNorth will reset the implemented flag and show you which values where changed:

![Implementation Status Tracking](https://github.com/steffendx/GoNorth/blob/master/TeaserImages/ImplementationStatus.PNG?raw=true)

This way its much easier to keep track of the integration progress and not forget changes.  
More details can be found [in the wiki](https://github.com/steffendx/GoNorth/wiki/Implementation-Status-Tracking).

## Task Management
A simple Kanban Board is integrated into GoNorth:

![Task Management](https://github.com/steffendx/GoNorth/blob/master/TeaserImages/Task.PNG?raw=true)

More details can be found [in the wiki](https://github.com/steffendx/GoNorth/wiki/Task-Management).

## Technology
GoNorth is implemented using .Net Core for the backend. Since .Net Core provides cross-plattform support you can host the portal on Windows, Linux and Mac OS.  
To store the values GoNorth currently uses a MongoDB System. Since GoNorth uses dependency injection and all database access is done through an interface it is possible to integrate a different database system. More details on this topic can be found in the wiki.  
Knockout is used for the frontend together with Bootstrap. The whole frontend is optimized for a responsive layout.   

## Browser Support
I've tested the web application using Chrome and Firefox. The portal might have problems running under Internet Explorer since this is a hobby, spare time project and I did not want to bother with all the Internet Explorer problems.

## Plans for the future
The next steps which I will implement in the future are:
 * Exporting of Npcs, Items and Dialogs to scripts 

## License
GoNorth is open source and released under the [MIT LICENSE](LICENSE).

Copyright (c) 2018 Steffen Noertershaeuser.

## Acknowledgement
GoNorth uses the following libraries:
 * [.Net Core](https://github.com/dotnet/core) licensed under MIT
 * [MongoDB](https://www.mongodb.com/) licensed under Apache License 2.0
 * [Bootstrap](https://getbootstrap.com/) licensed under MIT
 * [Knockout](http://knockoutjs.com/) licensed under MIT
 * [Leaflet](http://leafletjs.com/) licensed under BSD-License
 * [Leaflet.draw](https://github.com/Leaflet/Leaflet.draw) licensed under MIT
 * [JointJS](https://www.jointjs.com) licensed under Mozilla Public License Version 2.0
 * [SixLabors.ImageSharp](https://github.com/SixLabors/ImageSharp) licensed under Apache License 2.0
 * [Moment](https://github.com/moment/moment) licensed under MIT
 * [jQuery](https://jquery.org/) licensed under MIT
 * [jQuery UI](http://jqueryui.com/) licensed under MIT
 * [jQuery Validation](http://jqueryvalidation.org/) licensed under MIT
 * [Dropzone](https://github.com/enyo/dropzone) licensed under MIT
 * [bootstrap-wysiwyg](https://github.com/mindmup/bootstrap-wysiwyg) licensed under MIT
 * [bootstrap-tagsinput](https://github.com/bootstrap-tagsinput/bootstrap-tagsinput) licensed under MIT
 * [eonasdan-bootstrap-datetimepicker](https://github.com/Eonasdan/bootstrap-datetimepicker) licensed under MIT
 * [Fantasy Name Generator](https://github.com/skeeto/fantasyname) licensed under The Unlicense