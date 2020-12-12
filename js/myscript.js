/*
Title: Automata(DFA, NFA) Simulator
Author: Mohammad Imam Hossain
Date: 12/12/2020
All rights reserved.
*/

(function(){
    /// variable initialization
    var states=0;
    var transitions=0;

    ///color settings
    var stateColor='#ffc299';
    var borderandtextColor="#ff6600";
    var labelbgColor='#fff0e6';
    var stateSize=20;

    ///------------------------------overwriting sigma functionality--------------------------------
    ///------------------------------node id to nodel label return funtion------------------------------
    sigma.classes.graph.addMethod('getNodeLabel', function(nodeid){
        return this.nodesIndex[nodeid].label;
    });

    ///initializing the sigma graph
    var myGraph=new sigma.classes.graph();
    myGraph.read({
        nodes:[],
        edges:[]
    });

    ///initilizing sigma with default renderer
    var s=new sigma({
        id: 'sigmaapp',
        renderers: [
            {
                container: document.getElementById('graph-container'),
                type: 'canvas',
            }
        ],
        graph: myGraph,
        settings:{
            autoRescale: false,
            doubleClickEnabled: false,
            enableCamera: false, /// disabling the camera so that co-ordinate system remains stable
            enableEdgeHovering: true, ///the edges can be hovered to display special rendering adn detial text
            edgeHoverExtremities: true,

            defaultLabelColor: borderandtextColor, // to change the label color
            defaultLabelSize: 24, // to change the label size
            defaultLabelHoverColor: borderandtextColor, // the default text color of hovered labels
            defaultHoverLabelBGColor: labelbgColor, // default background color of hovered nodes labels

            defaultNodeColor: stateColor, // to change the node color
            borderSize: 2, // the size of the border of hovered nodes
            defaultNodeBorderColor: 'transparent',

            defaultEdgeColor: borderandtextColor,
            edgeColor: 'default',
            maxEdgeSize: 4,
            defaultEdgeHoverColor: '#803300',
            edgeHoverColor: 'default',

            defaultEdgeLabelColor: borderandtextColor,
            defaultEdgeLabelSize: 20,
        }
    });

    ///-------------------------------state creation-----------------------------------
    /// creating new node on a single click in the stage area
    s.bind('clickStage', createnewstate);
    function createnewstate(e){
        console.log('creating new node ... ...');
        console.log(e);

        ///click position
        var clickx=e.data.captor.x;
        var clicky=e.data.captor.y;

        /// creating the new state
        var stateid='q'+states;

        s.graph.addNode({
            id: stateid,
            label: stateid, ///initially id and label both are same
            x: clickx,
            y: clicky,
            size: stateSize,
            type: 'def'
        });

        console.log('new node created');
        console.log(s.graph.nodes());
        ++states; /// incrementing nodes count
        s.refresh(); /// refreshing the canvas
    }

    /// updating the node label or, node deletion
    s.bind('rightClickNode', showmodal);
    function showmodal(e){
        console.log('node clicked for update or deletion');
        console.log(e);

        var nodeid=e.data.node.id;
        document.getElementById('nodeid').value=nodeid;
        document.getElementById('statename').value=e.data.node.label;

        var statetype=e.data.node.type;
        if(statetype=='bothstate' || statetype=='startstate') document.getElementById('start-state').checked=true;
        if(statetype=='bothstate' || statetype=='finalstate') document.getElementById('final-state').checked=true;

        ///showing the modal
        $('#statemodal').modal('show');
    }

    /// updating the node when update button is clicked from the modal
    document.getElementById('updatestate').addEventListener('click',updatestate);
    function updatestate(e){
        console.log('state update event');
        console.log(e);

        /// receiving state type
        var isstart=document.getElementById('start-state').checked;
        var isfinal=document.getElementById('final-state').checked;
        console.log(isstart+" , "+isfinal);

        var statetype='def'; /// initializing with default state
        if(isstart && isfinal){
            statetype='bothstate';
        }
        else if(isstart && !isfinal){
            statetype='startstate';
        }
        else if(!isstart && isfinal){
            statetype='finalstate';
        }

        /// receiving state label
        var newstatelabel=document.getElementById('statename').value;
        var nodeid=document.getElementById('nodeid').value;

        ///updating state properties
        var allnodes=s.graph.nodes();
        for(var ind in allnodes){
            var tmpstate=allnodes[ind];
            if(tmpstate.id==nodeid){
                tmpstate.label=newstatelabel;
                tmpstate.type=statetype;
            }
        }

        console.log('update successfull');
        console.log(s.graph.nodes());
        s.refresh();

        ///resetting the modal
        resetmodal();
    }

    /// deleting the state when delete button is clicked within the modal
    document.getElementById('deletestate').addEventListener('click',deletestate);
    function deletestate(e){
        console.log('state delete event');
        console.log(e);

        var nodeid=document.getElementById('nodeid').value;

        s.graph.dropNode(nodeid);
        console.log('state deletion successful');
        console.log(s.graph.nodes());
        s.refresh();

        ///resetting the modal
        resetmodal();
    }

    function resetmodal(){
        /// resetting all the modal fields
        document.getElementById('start-state').checked=false;
        document.getElementById('final-state').checked=false;
        document.getElementById('statename').value="";
    }

    ///rendering start state
    sigma.canvas.nodes.startstate=function(node, context, settings){
        var prefix=settings('prefix') || '';
        var size=node[prefix+'size'];

        context.fillStyle=node.color||settings('defaultNodeColor');
        context.strokeStyle=borderandtextColor;
        context.lineWidth=2;

        context.beginPath();
        context.moveTo(node[prefix+'x']-size*3,node[prefix+'y']);
        context.lineTo(node[prefix+'x']-size,node[prefix+'y']);
        context.stroke();

        context.moveTo(node[prefix+'x']-size-8,node[prefix+'y']-8);
        context.lineTo(node[prefix+'x']-size,node[prefix+'y']);
        context.stroke();

        context.moveTo(node[prefix+'x']-size-8,node[prefix+'y']+8);
        context.lineTo(node[prefix+'x']-size,node[prefix+'y']);
        context.stroke();

        context.moveTo(node[prefix+'x'],node[prefix+'y']);
        context.arc(
            node[prefix+'x'],
            node[prefix+'y'],
            size,
            0,
            Math.PI*2
        );
        context.closePath();
        context.fill();
    };

    ///rendering final state
    sigma.canvas.nodes.finalstate=function(node, context, settings){
        var prefix=settings('prefix') || '';
        var size=node[prefix+'size'];

        context.fillStyle=node.color||settings('defaultNodeColor');
        context.strokeStyle=borderandtextColor;
        context.lineWidth=2;

        context.beginPath();
        context.arc(
            node[prefix+'x'],
            node[prefix+'y'],
            size-3.5,
            0,
            Math.PI*2
        );
        context.stroke();
        context.fill();

        // context.beginPath();
        // context.arc(
        //     node[prefix+'x'],
        //     node[prefix+'y'],
        //     size-4,
        //     0,
        //     Math.PI*2
        // );
        // context.stroke();

        /// outer circle
        context.beginPath();
        context.arc(
            node[prefix+'x'],
            node[prefix+'y'],
            size,
            0,
            Math.PI*2
        );
        context.stroke();
    };

    ///rendering both state
    sigma.canvas.nodes.bothstate=function(node, context, settings){
        var prefix=settings('prefix') || '';
        var size=node[prefix+'size'];

        context.fillStyle=node.color||settings('defaultNodeColor');
        context.strokeStyle=borderandtextColor;
        context.lineWidth=2;

        context.beginPath();
        context.moveTo(node[prefix+'x']-size*3,node[prefix+'y']);
        context.lineTo(node[prefix+'x']-size,node[prefix+'y']);
        context.stroke();

        context.moveTo(node[prefix+'x']-size-8,node[prefix+'y']-8);
        context.lineTo(node[prefix+'x']-size,node[prefix+'y']);
        context.stroke();

        context.moveTo(node[prefix+'x']-size-8,node[prefix+'y']+8);
        context.lineTo(node[prefix+'x']-size,node[prefix+'y']);
        context.stroke();

        context.beginPath();
        context.arc(
            node[prefix+'x'],
            node[prefix+'y'],
            size-3.5,
            0,
            Math.PI*2
        );
        context.stroke();
        context.fill();

        /// outer circle
        context.beginPath();
        context.arc(
            node[prefix+'x'],
            node[prefix+'y'],
            size,
            0,
            Math.PI*2
        );
        context.stroke();
    };

    ///------------------------------------edge creation-------------------------------

    /// edge creating operation
    var clickcounter=0;
    var prevnodeid=-1;
    s.bind('doubleClickNode',function(e){
        console.log('node selected');
        console.log(event);

        var nodeid=e.data.node.id;

        ++clickcounter;
        if(clickcounter==1){
            prevnodeid=nodeid;
            ///updating state properties
            var allnodes=s.graph.nodes();
            for(var ind in allnodes){
                var tmpstate=allnodes[ind];
                if(tmpstate.id==nodeid){
                    tmpstate.color='#b34700';
                }
            }
            s.refresh();
        }
        else if(clickcounter==2){

            ///reverseedge check
            var isreverse=false;
            var alledges=s.graph.edges();
            for(var ind in alledges){
                var tmpedge=alledges[ind];
                if(tmpedge.source==nodeid && tmpedge.target==prevnodeid){
                    tmpedge.type="curvedArrow";
                    isreverse=true;
                    break;
                }
            }

            ///adding new edge
            var edgeid='t'+transitions;
            var edgelabel=String.fromCharCode(949);
            var edgetype='arrow';
            if(prevnodeid==nodeid || isreverse==true){
                edgetype='curvedArrow';
            }


            s.graph.addEdge({
                id: edgeid,
                label: edgelabel,
                source: prevnodeid,
                target: nodeid,
                size: 3,
                type: edgetype
            });
            ++transitions; ///increment 1 transitions

            ///setting previous state color to source state
            var allnodes=s.graph.nodes();
            for(var ind in allnodes){
                var tmpstate=allnodes[ind];
                if(tmpstate.id==prevnodeid){
                    tmpstate.color=stateColor;
                }
            }

            s.refresh();
            console.log('New edge added ... ...');

            clickcounter=0; /// returning back to initial position
            prevnodeid=-1; /// returning back to initial previous node id
        }
    });

    /// edge edit or delete operation
    s.bind('rightClickEdge', showedgemodal);
    function showedgemodal(e){
        console.log('edge clicked for update or delete');
        console.log(e);

        var edgeid=e.data.edge.id;
        document.getElementById('edgeid').value=edgeid;

        document.getElementById('edgelabel').value=e.data.edge.label;

        ///showing the modal
        $('#edgemodal').modal('show');
    }

    ///epsilon generator
    document.getElementById('edgelabel').addEventListener('keyup', printepsilon);
    function printepsilon(e){
        var curval=e.target.value;
        var newcurval=curval.replace(/<ep>/g, String.fromCharCode(949));
        e.target.value=newcurval;
    }

    /// updating the transition label when update button is clicked
    document.getElementById('updateedge').addEventListener('click', updateedgelabel);
    function updateedgelabel(e){
        console.log('update edge button clicked');
        console.log(e);

        var newedgelabel=document.getElementById('edgelabel').value;
        if(newedgelabel==''){
            newedgelabel=String.fromCharCode(949); ///for empty label, default label = epsilon
        }

        var edgeid=document.getElementById('edgeid').value;
        var alledges=s.graph.edges();
        for(var ind in alledges){
            var tmpedge=alledges[ind];
            if(tmpedge.id==edgeid){
                tmpedge.label=newedgelabel;
                break;
            }
        }

        s.refresh();
        console.log('transition label updated');
        ///resetting the modal fields
        resetedgemodal();
    }

    function resetedgemodal(){
        document.getElementById('edgeid').value="";
        document.getElementById('edgelabel').value="";
    }

    /// deleting teh transition edge when delete button is clicked
    document.getElementById('deleteedge').addEventListener('click',deleteedge);
    function deleteedge(e){
        console.log('delete edge clicked');
        console.log(e);

        s.refresh(); // first refreshing otherwise an error occurs

        ///deletion operation
        var edgeid=document.getElementById('edgeid').value;

        try{
            ///dropping edges now
            console.log(s.graph.edges());
            s.graph.dropEdge(edgeid);
            console.log(s.graph.edges());

            s.refresh();
            console.log('edge deletion successful.');
        }
        catch(err){
            console.log('edge deletion error');
        }

        resetedgemodal();
    }

    ///---------------------------------dragging nodes--------------------------------

    // Initialize the dragNodes plugin:
    var dragListener = sigma.plugins.dragNodes(s, s.renderers[0]);

    dragListener.bind('startdrag', function(event) {
      console.log(event);
    });
    dragListener.bind('drag', function(event) {
      console.log(event);
    });
    dragListener.bind('drop', function(event) {
      console.log(event);
    });
    dragListener.bind('dragend', function(event) {
      console.log(event);
    });

    ///------------------------------js object builder----------------------------------
    function buildobj(){
        var obj=new Object();
        obj.errors=[]; ///this array will contain all the errors

        var basicgraph=s.graph;
        var allstates=basicgraph.nodes();
        var alltransitions=basicgraph.edges();

        if(allstates.length>0){
            ///at least 1 state exists

            ///calculating components number 1,4,5
            var comp1arr=[]; ///set of states, ids
            var comp2arr=[]; ///Alphabet or, set of symbols
            var comp3obj=new Object(); ///transition table object, contains state ids
            var comp4string=""; ///start state, id
            var comp5arr=[]; ///set of final states, ids

            ///using a start state counter to find out more than one start states
            var startstatecount=0;
            for(var ind in allstates){
                var tmpstate=allstates[ind];
                var tmpstateid=tmpstate.id;

                comp1arr.push(tmpstateid); ///adding the state

                ///testing start state
                if(tmpstate.type=='startstate' || tmpstate.type=='bothstate'){
                    comp4string=tmpstateid;
                    startstatecount++;
                }

                ///testing final state
                if(tmpstate.type=='finalstate'  || tmpstate.type=='bothstate'){
                    comp5arr.push(tmpstateid);
                }
            }

            if(startstatecount==1){
                ///only 1 start state found

                ///finding out component 2
                var arrofsymbols=[]; ///it will contain all symbols with repetition
                for(var ind in alltransitions){
                    var tmpedge=alltransitions[ind];
                    var tmpedgelabel=tmpedge.label;

                    var tmparr=tmpedgelabel.split(','); ///splitting all individual alphabets

                    arrofsymbols=arrofsymbols.concat(tmparr);
                }
                ///finding out unique symbols
                var uniquesymbols = arrofsymbols.filter((item, i, ar) => ar.indexOf(item) === i);
                ///removing empty character alphabets
                var comp2arr = uniquesymbols.filter((item,i,ar) => (item=="") ? false : true);
                ///sorting the alphabet set
                comp2arr.sort();

                ///finding out component 3
                for(var ind in alltransitions){
                    var tmpedge=alltransitions[ind];
                    var tmpedgelabel=tmpedge.label;

                    var src=tmpedge.source;  ///this returns only node id
                    var dest=tmpedge.target; /// this returns only node id

                    var chars=tmpedgelabel.split(',');
                    for(var ind1 in chars){
                        ///for each input symbol we are saving the destination to cell src, alphabet
                        var symbol=chars[ind1];

                        ///first checking whether the src already exists within comp2obj
                        var comp3objkeys=Object.keys(comp3obj);
                        if(comp3objkeys.indexOf(src)!=-1){
                            ///the object has key named 'src'

                            ///now checking whether key exists for the input symbol
                            var symbolkeys=Object.keys(comp3obj[src]);
                            if(symbolkeys.indexOf(symbol)!=-1){
                                comp3obj[src][symbol].push(dest);
                            }
                            else{
                                ///creating key for this new symbol
                                comp3obj[src][symbol]=[];
                                comp3obj[src][symbol].push(dest);
                            }
                        }
                        else{
                            ///creating new entry for src
                            comp3obj[src]=new Object();
                            comp3obj[src][symbol]=[];
                            comp3obj[src][symbol].push(dest);
                        }

                        comp3obj[src][symbol].sort(); ///keeping the values in sorted order
                    }
                }

                ///building the final object
                obj['comp1']=comp1arr;
                obj['comp2']=comp2arr;
                obj['comp3']=comp3obj;
                obj['comp4']=comp4string;
                obj['comp5']=comp5arr;
            }
            else{
                if(startstatecount>1) obj.errors.push('Invalid state diagram. More than 1 start states!!!!');
                else if(startstatecount==0) obj.errors.push('Invalid state diagram. No Start state defined!!!!');
            }
        }
        else{
            obj.errors.push('Empty state diagram.');
        }

        ///finally returning the obj object
        console.log(obj);
        return obj;
    }

    ///------------------------------showing transition table on request--------------------
    document.getElementById('showtrtable').addEventListener('click',showtransitiontable);
    function showtransitiontable(e){
        console.log('showing transtion table');
        console.log(e);

        var stateobj=buildobj();
        if(stateobj.errors.length==0){
            var tablestring="";
            tablestring+="<table class='table table-striped'>";
                ///writing table heading section
                tablestring+="<thead><tr>";
                    tablestring+="<th></th>"; ///adding first empty column
                    for(var ind in stateobj['comp2']){
                        var cursymbol=stateobj['comp2'][ind];
                        tablestring+="<th>"+cursymbol+"</th>"; ///adding 1 column per alhapbet symbol
                    }
                tablestring+="</tr></thead>";

                ///creating table body layout
                tablestring+="<tbody>";
                    ///adding rows for each state
                    for(var ind in stateobj['comp1']){
                        tablestring+="<tr>";
                        var curstateid=stateobj['comp1'][ind];

                            tablestring+="<th><b><code>"+s.graph.getNodeLabel(curstateid)+"</b></code></th>";
                            for(var ind1 in stateobj['comp2']){
                                tablestring+="<td>{ ";
                                var cursymbol=stateobj['comp2'][ind1];
                                console.log(curstateid+" "+cursymbol);
                                    ///transition table may or may not have entry for this state and symbol
                                    ///let's check
                                    var statekeys=Object.keys(stateobj['comp3']);
                                    if(statekeys.indexOf(curstateid)!=-1){
                                        var content=stateobj['comp3'][curstateid];
                                        ///this state may not have values for each symbol
                                        var symbolkeys=Object.keys(content);
                                        if(symbolkeys.indexOf(cursymbol)!=-1){
                                            var finalcontent=content[cursymbol];
                                            console.log(finalcontent);
                                            var contentstring=finalcontent.map(s.graph.getNodeLabel).join(',');
                                            console.log(contentstring);
                                            tablestring+=contentstring;
                                        }
                                        else{
                                            ///no entry exists for this symbol
                                            tablestring+="";
                                        }

                                    }
                                    else{
                                        ///no transitions for this state
                                        tablestring+="";
                                    }

                                tablestring+=" }</td>";
                            }

                        tablestring+="</tr>";
                    }
                tablestring+="</tbody>";

            tablestring+="</table>";
            document.getElementById('tablecontainer').innerHTML=tablestring;

            ///hiding the collapsible pane section
            $('.collapse').collapse('toggle');
        }
        else{
            console.log(stateobj['errors']);
            ///hiding the collapsible pane section
            $('.collapse').collapse('hide');
            window.alert("Invalid State Diagram.");
        }
    }

    ///--------------------formal definition generation----------------------------
    document.getElementById('generatebtn').addEventListener('click',generateformaldef);
    function generateformaldef(e){
        var stateobj=buildobj();
        if(stateobj.errors.length==0){
            document.getElementById('comp1').innerText=stateobj['comp1'].map(s.graph.getNodeLabel).join(',');
            document.getElementById('comp2').innerText=stateobj['comp2'].filter((item, i, ar) => (item==String.fromCharCode(949)) ? false : true).join(',');
            document.getElementById('comp4').innerText=s.graph.getNodeLabel(stateobj['comp4']);
            document.getElementById('comp5').innerText=stateobj['comp5'].map(s.graph.getNodeLabel).join(',');
        }
        else{
            console.log(stateobj['errors']);
            window.alert("Invalid State Diagram.");
        }
    }

    ///-------------------input simulation string-----------------------------------------------------------
    document.getElementById('simulatebtn').addEventListener('click', simulatemodal);
    function simulatemodal(e){
        console.log('input simulation clicked');
        console.log(e);

        var stateobj=buildobj();
        if(stateobj['errors'].length==0){
            ///valid graph


        }
        else{
            console.log(stateobj['errors']);
            window.alert("Invalid State Diagram.");
        }
    }
})();
