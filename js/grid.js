available_concepts = {};
concept_ids = {};
visible_concepts = [];
MAX_VISIBLE_CONCEPTS = 10;
MAX_AVAILABLE_CONCEPTS = 5;
all_concepts = [
    {id : 0, name: "Closures", comment: ""},
    {id : 1, name: "Pointers", comment: ""},
    {id : 2, name: "Package importing", comment: ""},
    {id : 3, name: "Linking", comment: ""},
    {id : 4, name: "Arrays", comment: ""},
    {id : 5, name: "Sets", comment: ""},
    {id : 6, name: "Dictionaries", comment: ""},
    {id : 7, name: "Objects", comment: ""},
    {id : 8, name: "Real-time Data", comment: ""},
    {id : 9, name: "While loops", comment: ""},
    {id : 10, name: "Do Until loops", comment: ""},
    {id : 11, name: "Recursion", comment: ""},
    {id : 12, name: "Tail Recursion", comment: ""},
    {id : 13, name: "File I/O", comment: ""},
    {id : 14, name: "Unix Filesystems", comment: ""},
    {id : 15, name: "If Statements", comment: ""},
    {id : 16, name: "Parsing JSON in Python", comment: ""},
    {id : 17, name: "Parsing JSON in C++", comment: ""},
    {id : 18, name: "Pointers vs. References", comment: ""},
    ];

function getNewConcepts(user) {
}
function getCompletedConcepts(user) {
}
function setConcept(user, id, x, y, comment) {
}

// Remove the concept from the Grid, adding it back to the available list.
function unsetConcept(id) {
    name = concept_ids[id];
    delete available_concepts[name];
    $("#concept-" + id).remove();
    // Fire off notification to the server
    all_concepts.push({name: name, id: id, comment: ""});
}

function resizeCSGrid() {
    // Resize the grid and dashboard to the height of the window
    $(".cs-grid").height($(window).height());
    $("#dashboard-bottom").height($(window).height()-$("#dashboard-top").height());
    // Move each dropped concept to a rescaled position
    origin = getBoundingBox(".cs-grid");
    for (concept in available_concepts) {
        if (available_concepts[concept].dropped) {
            ref = available_concepts[concept].ref;
            self = getBoundingBox(ref);
            $(ref).offset({"left": origin.x + available_concepts[concept].x * origin.width - self.width/2,
                           "top": origin.y + available_concepts[concept].y * origin.height - self.height/2});
        }
    }
}

function getBoundingBox(obj) {
    return {"x" : $(obj).offset().left,
            "y" : $(obj).offset().top,
            "width" : $(obj).width(),
            "height" : $(obj).height()};
}

function layoutCurrentConcepts() {
    $("#concepts .hidden-list div").each(function () {
        id = $(this).attr("concept-id");
        $("#concept-"+id).offset($("#concept-padding-"+id).offset());
    });
    $("#dashboard-bottom").height($(window).height()-$("#dashboard-top").height());
}

function buildConceptDialog() {
    $('#concept-dialog-delete').button();
    $("#concept-dialog").dialog({
        autoOpen: false,
        title: "Unknown",
        dialogClass: 'noTitleStuff',
        buttons: [
            {text : "Delete", 
             priority: 'secondary', 
             "class": "btn btn-danger", 
             click: function() {
                id =  $("#concept-dialog").attr("concept-id");
                unsetConcept(id);
                $(this).dialog("close");
            }},
            {text : "Cancel", click: function() {
                id =  $("#concept-dialog").attr("concept-id");
                $(this).dialog("close");
                $("#concept-"+id).css({"font-weight": "normal"});
            }},
            {text : "Okay", click: function() {
                id =  $("#concept-dialog").attr("concept-id");
                name = concept_ids[id];
                comment =  $("#concept-dialog textarea").val();
                available_concepts[name].comment = comment;
                if (available_concepts[name].comment != "") {
                    $(available_concepts[name].ref).css({"font-style" : "italic"});
                } else {
                    $(available_concepts[name].ref).css({"font-style" : "normal"});
                }
                $("#completed-concepts li[concept-id="+id+"] span").last().text(comment);
                $("#concept-"+id).css({"font-weight": "normal"});
                $(this).dialog("close");
            }}
        ]
    });
}

function openConceptEditor(name, id) {
    if (available_concepts[name].dropped) {
        if ($("#concept-dialog").dialog("isOpen")) {
            $("#concept-"+$("#concept-dialog").attr("concept-id")).css({"font-weight": "normal"});
        }
        $("#concept-"+id).css({"font-weight": "bold"});
        $("#concept-dialog").dialog("option", "title", name);
        $("#concept-dialog").dialog("option", "position", {
            "my" : "right-10% bottom-10%",
            "of": "horizontal",
            "collision": "flip",
            "of" : available_concepts[name].ref
        });
        $("#concept-dialog textarea").val(available_concepts[name].comment);
        $("#concept-dialog").attr("concept-id", id);
        $("#concept-dialog").dialog("open");
        $(this).css({"font-weight": "bold"});
    }
}

function dropConcept(id) {
    if (-1 == $.inArray(id, visible_concepts)) {
        $("#concept-"+id).show();
        visible_concepts.push(id);
        while (visible_concepts.length > MAX_VISIBLE_CONCEPTS) {
            hiding_element = visible_concepts.shift();
            $("#concept-"+hiding_element).hide();
        }
    }
}

function createNewDraggableConcept(name, id, comment) {
    concept_ids[id] = name;
    available_concepts[name] = {"ref": "#concept-"+id,
                      "x": 0,
                      "y": 0,
                      "set": false,
                      "name": name,
                      "id": id,
                      "comment": comment};
    $("#concepts .hidden-list").append("<div id='concept-padding-"+id+"' concept-id='"+id+"'>"+name+"</div>");
    concept = $("<span id='concept-"+id+"' class='concept' concept-id='"+id+"'>"+name+"</span>");
    if (comment != "") {
        concept.css({"font-style" : "italic"});
    }
    concept.draggable({
        distance: 10,
        scroll: false,
        start: function() {
            $("#concept-dialog").dialog("close");
        },
        drag: function() {
            $(this).css({"font-weight": "bold"});
        },
        stop: function() {
            $(this).css({"font-weight": "normal"});
            self = getBoundingBox(this);
            origin = getBoundingBox(".cs-grid");
            newX = self.x;
            newY = self.y;
            x = (self.x - origin.x);
            y = (self.y - origin.y);
            if (x < 0) {
                newX = origin.x;
            }
            if (y < 0) {
                newY = origin.y;
            }
            if (x > origin.width - self.width) {
                newX = origin.x + origin.width - self.width;
            }
            if (y > origin.height - self.height) {
                newY = origin.y + origin.height - self.height;
            }
            if (newX != x || newY != y) {
                $(available_concepts[name].ref).appendTo(".cs-grid");
                $(this).offset({"top": newY, "left": newX});
            }
            self = getBoundingBox(this);
            x = (self.x - origin.x + self.width/2) / origin.width;
            y = (self.y - origin.y + self.height/2) / origin.height;
            available_concepts[name].x = x;
            available_concepts[name].y = y;
            $("#concept-padding-" +id).remove();
            red = Math.floor(x * 200);
            blue = Math.floor(y * 200);
            if (available_concepts[name].dropped) {
                $("#completed-concepts li[concept-id="+id+"] span").first().css({"background-color" : "rgb("+red+","+blue+",128)"});
            } else {
                completed_concept = $("<li concept-id='"+id+"'><span class='badge' style='background-color:rgb("+red+","+blue+",128)'>"+name+"</span><span>"+comment+"</span></li>");
                completed_concept.click(function() {
                    dropConcept(id);
                    openConceptEditor(name, id);
                });
                $("#completed-concepts").append(completed_concept);
            }
            available_concepts[name].dropped = true;
            dropConcept(id);
            layoutCurrentConcepts();            
        }});
    concept.click(function() {
        openConceptEditor(name, id);
    });
    concept.css({"position": "absolute"});
    $("#concepts").append(concept);
    layoutCurrentConcepts();
}

$(document).ready(function() {
    window.onresize = resizeCSGrid;
    resizeCSGrid();
    buildConceptDialog();
    createNewDraggableConcept("Closures", 1, "My comment");
    createNewDraggableConcept("Copy Constructors", 2, "");
    createNewDraggableConcept("Pointers", 100, "A longer comment");
    createNewDraggableConcept("Reading from a file", 77, "This is a much much longer comment. It should be just enough. This is a much much longer comment. It should be just enough.");
    createNewDraggableConcept("Local variables vs. global variables", 870, "");
});