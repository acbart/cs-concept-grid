/**
Concepts are either unseen, available, or completed.
If they are completed, they can also be visible; available concepts are always
visible. The MAX_VISIBLE_CONCEPTS are always shown.
Only MAX_AVAILABLE_CONCEPTS are available at any given time.

A concept has:
    id: integer
    name: string
    comment: string
    x: float
    y: float
    ref: string (Jquery path to the concept on the Grid or in the Available list)
    state: string (either "unseen", "available", "completed")
**/

MAX_VISIBLE_CONCEPTS = 15;
MAX_AVAILABLE_CONCEPTS = 5;
CONCEPTS_PER_RANK = 10;
user = "acbart";
available_concepts = [];
visible_concepts = [];
completed_concepts = [];
RANKS = ["Undergraduate Student", "Masters Student", "PhD Student", "Post-doc", "Assistant Professor", "Associate Professor", "Full Professor", "Dean", "Provost", "President"];
unseen_concepts = [
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
$.each(unseen_concepts, function(index, concept) {
    concept.state = "unseen";
});

function updateProgressBar() {
    rank = Math.floor(completed_concepts.length / CONCEPTS_PER_RANK);
    if (rank < RANKS.length) {
        $("#rank").text(RANKS[rank]);
    } else {
        $("#rank").text(RANKS[RANKS.length]);
    }
    progress = Math.floor(100 * (completed_concepts.length / CONCEPTS_PER_RANK) % 100);
    $("#rank-progress").css({"width":  progress + "%"}).text(progress+"% Complete");
}

function lookupConcept(list, id) {
    for (i = 0; i < list.length; i += 1) {
        if (list[i].id == id) {
            return list[i];
        }
    }
    return null;
}

function removeConcept(list, id) {
    for (i = 0; i < list.length; i += 1) {
        if (list[i].id == id) {
            list.splice(i, 1);
            break;
        }
    }
}

function moveConcept(id, from, to) {
    for (i = 0; i < from.length; i += 1) {
        if (from[i].id == id) {
            concept = from[i];
            from.splice(i, 1);
            break;
        }
    }
    to.push(concept);
    return concept;
}

function getNewConcepts(user) {
}
function getCompletedConcepts(user) {
}
function setConcept(user, id, x, y, comment) {
}
function updateConceptOnServer(user, concept) {
}
function unsetConceptOnServer(user, id) {
}

// Attempt to add new concepts from the All list to the Available list
function fillAvailableConcepts() {
    while (available_concepts.length < MAX_AVAILABLE_CONCEPTS) {
        if (unseen_concepts.length > 0) {
            makeConceptAvailable(unseen_concepts[0]);
        } else {
            break;
        }
    }
    // We're all out of concepts; way to go!
    if (unseen_concepts.length == 0 && available_concepts.length == 0) {
    }
}

// Remove the concept from the Grid, adding it back to the available list.
function unsetConcept(id) {
    // Update model
    concept = moveConcept(id, available_concepts, unseen_concepts);
    concept.comment = "";
    concept.state = "unseen";
    unsetConceptOnServer(user, id);
    // Update view
    $("#concept-" + id).remove();
    fillAvailableConcepts();
    updateProgressBar();
}

// Convert the internal coordinates on the grid to the ones used by the browser
function internalCoordinatesToGrid(concept, grid) {
    self = getBoundingBox(concept.ref);
    return {"left": grid.x + concept.x * grid.width - self.width/2,
            "top": grid.y + concept.y * grid.height - self.height/2}
}

// Fired when the window is resized, to ensure the View is correct
function resizeCSGrid() {
    // Resize the grid to the height of the window
    $(".cs-grid").height($(window).height());
    // Resize the dashboard's completed concepts to part of the window height
    $("#dashboard-bottom").height($(window).height()-$("#dashboard-top").height());
    // Move each dropped concept to a rescaled position
    grid = getBoundingBox(".cs-grid");
    for (i = 0; i < completed_concepts.length; i++) {
        concept = completed_concepts[i];
        $(concept.ref).offset(internalCoordinatesToGrid(concept, grid));
    }
}

// Returns a more manageable dictionary of an object's offset (x,y,width,height)
function getBoundingBox(obj) {
    return {"x" : $(obj).offset().left,
            "y" : $(obj).offset().top,
            "width" : $(obj).width(),
            "height" : $(obj).height()};
}

// Matches up every available concept with the underlying hidden representation
// of it. This is done because concepts are absolutely positioned, and that's
// bloody hard to layout manually. So we make the browser do the work :D
function layoutAvailableConcepts() {
    $("#concepts .hidden-list div").each(function () {
        id = $(this).attr("concept-id");
        $("#concept-"+id).offset($("#concept-padding-"+id).offset());
    });
    $("#dashboard-bottom").height($(window).height()-$("#dashboard-top").height());
}

function boldConcept(id) {
    $("#concept-"+id).css({"font-weight": "bold"});
}
function unboldConcept(id) {
    $("#concept-"+id).css({"font-weight": "normal"});
}
function italicizeConcept(id) {
    $("#concept-"+id).css({"font-style" : "italic"});
}
function unitalicizeConcept(id) {
    $("#concept-"+id).css({"font-style" : "normal"});
}
function updateConceptComment(concept, new_comment) {
    concept.comment = new_comment;
    $("#completed-concepts li[concept-id="+concept.id+"] span").last().text(new_comment);
    updateConceptOnServer(user, concept);
}

// Create the pop-up dialog for concepts when they're pressed
function buildConceptDialog() {
    $("#concept-dialog").dialog({
        autoOpen: false,
        title: "Unknown",
        dialogClass: 'noTitleStuff',
        buttons: [
            {text : "Delete",  priority: 'secondary',  "class": "btn btn-danger", click: function() {
                id =  $("#concept-dialog").attr("concept-id");
                unsetConcept(id);
                $(this).dialog("close");
            }},
            {text : "Cancel", click: function() {
                id =  $("#concept-dialog").attr("concept-id");
                unboldConcept(id);
                $(this).dialog("close");
            }},
            {text : "Okay", click: function() {
                id =  $("#concept-dialog").attr("concept-id");
                concept = lookupConcept(completed_concepts, id);
                new_comment =  $("#concept-dialog textarea").val();
                // Update model
                updateConceptComment(concept, new_comment);
                // Update View
                if (concept.comment != "") {
                    italicizeConcept(id);
                } else {
                    unitalicizeConcept(id);
                }
                unboldConcept(id);
                $(this).dialog("close");
            }}
        ]
    });
}

// Open up the Concept Editor with the current concept
function openConceptEditor(concept) {
    if ($("#concept-dialog").dialog("isOpen")) {
        dialog_id = $("#concept-dialog").attr("concept-id");
        unboldConcept(dialog_id);
    }
    boldConcept(concept.id);
    $("#concept-dialog").dialog("option", "title", concept.name);
    $("#concept-dialog").dialog("option", "position", {
        "my" : "right-10% bottom-10%",
        "of": "horizontal",
        "collision": "flip",
        "of" : concept.ref
    });
    $("#concept-dialog textarea").val(concept.comment);
    $("#concept-dialog").attr("concept-id", concept.id);
    $("#concept-dialog").dialog("open");
}

// If the concept is hidden, then show it.
function showConcept(id) {
    if (-1 == $.inArray(id, visible_concepts)) {
        $("#concept-"+id).show();
        visible_concepts.push(id);
        while (visible_concepts.length > MAX_VISIBLE_CONCEPTS) {
            hiding_element = visible_concepts.shift();
            $("#concept-"+hiding_element).hide();
        }
    }
}

// Add the default information to the concept that might be missing
function expandUnseenConcept(concept) {
    concept.x = 0;
    concept.y = 0;
    concept.ref = "#concept-"+concept.id;
    concept.state = "available";
}

function forceWithinGrid(origin, self) {
    result = {}
    result.x = self.x;
    result.y = self.y;
    x = (self.x - origin.x);
    y = (self.y - origin.y);
    if (x < 0) {
        result.x = origin.x;
    }
    if (y < 0) {
        result.y = origin.y;
    }
    if (x > origin.width - self.width) {
        result.x = origin.x + origin.width - self.width;
    }
    if (y > origin.height - self.height) {
        result.y = origin.y + origin.height - self.height;
    }
    result.changed = (y != result.y) || (x != result.x);
    return result;
}

function makeConceptAvailable(concept) {
    expandUnseenConcept(concept);
    moveConcept(concept.id, unseen_concepts, available_concepts);
    // Add this concept to the hidden list used for spacing
    $("#concepts .hidden-list").append("<div id='concept-padding-"+concept.id+"' class='concept-padding' concept-id='"+concept.id+"'>"+concept.name+"</div>");
    // Create the visible concept that will be absolutely positioned
    $("#concepts").append("<span id='concept-"+concept.id+"' class='concept' concept-id='"+concept.id+"'>"+concept.name+"</span>");
    if (concept.comment != "") {
        italicizeConcept(concept.id);
    }
    $(concept.ref).draggable({
        distance: 10,
        scroll: false,
        start: function() {
            $("#concept-dialog").dialog("close");
        },
        drag: function() {
            boldConcept(concept.id);
        },
        stop: function() {
            unboldConcept(concept.id);
            origin = getBoundingBox(".cs-grid");
            self = getBoundingBox(this);
            snapped = forceWithinGrid(origin, self);
            if (snapped.changed) {
                $(concept.ref).appendTo(".cs-grid");
                $(concept.ref).offset({"left": snapped.x, "top": snapped.y});
                self = getBoundingBox(concept.ref);
            }
            concept.x = (self.x - origin.x + self.width/2) / origin.width;
            concept.y = (self.y - origin.y + self.height/2) / origin.height;
            $("#concept-padding-"+concept.id).remove();
            if (concept.state == "available") {
                moveConcept(concept.id, available_concepts, completed_concepts);
                completed_concept = $("<li concept-id='"+concept.id+"'><span class='completed-concept badge'>"+concept.name+"</span><span>"+concept.comment+"</span></li>");
                completed_concept.click(function() {
                    showConcept(concept.id);
                    openConceptEditor(concept);
                });
                $(concept.ref).click(function() {
                    openConceptEditor(concept);
                });
                $("#completed-concepts").append(completed_concept);
                concept.state = "completed";
            }
            red = Math.floor(concept.x * 200);
            blue = Math.floor(concept.y * 200);
            $("#completed-concepts li[concept-id="+concept.id+"] span").first().css({"background-color" : "rgb("+red+","+blue+",128)"});
            showConcept(concept.id);
            layoutAvailableConcepts();            
            fillAvailableConcepts();
            updateProgressBar();
        }});
    $(concept.ref).css({"position": "absolute"});
    layoutAvailableConcepts();
}

$(document).ready(function() {
    window.onresize = resizeCSGrid;
    resizeCSGrid();
    buildConceptDialog();
    fillAvailableConcepts();
    updateProgressBar();
});