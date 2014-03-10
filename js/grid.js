concepts = {}
concept_ids = {}

function getNewConcepts(user) {
}
function getCompletedConcepts(user) {
}
function setConcept(user, id, x, y, comment) {
}

function unsetConcept(id) {
    name = concept_ids[id];
    delete concepts[name];
    $("#concept-" + id).remove();
}

function resizeCSGrid() {
    $(".cs-grid").height($(window).height());
    $("#dashboard-bottom").height($(window).height()-$("#dashboard-top").height());
    origin = getBoundingBox(".cs-grid");
    for (concept in concepts) {
        if (concepts[concept].dropped) {
            ref = concepts[concept].ref;
            self = getBoundingBox(ref);
            $(ref).offset({"left": origin.x + concepts[concept].x * origin.width - self.width/2,
                           "top": origin.y + concepts[concept].y * origin.height - self.height/2});
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
                $(this).dialog("close");
            }},
            {text : "Okay", click: function() {
                id =  $("#concept-dialog").attr("concept-id");
                name = concept_ids[id];
                comment =  $("#concept-dialog textarea").val();
                concepts[name].comment = comment;
                if (concepts[name].comment != "") {
                    $(concepts[name].ref).css({"font-style" : "italic"});
                } else {
                    $(concepts[name].ref).css({"font-style" : "normal"});
                }
                $("#completed-concepts li[concept-id="+id+"] span").last().text(comment);
                $(this).dialog("close");
            }}
        ]
    });
}

function createNewDraggableConcept(name, id, comment) {
    concept_ids[id] = name;
    concepts[name] = {"ref": "#concept-"+id,
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
                $(concepts[name].ref).appendTo(".cs-grid");
                $(this).offset({"top": newY, "left": newX});
            }
            self = getBoundingBox(this);
            x = (self.x - origin.x + self.width/2) / origin.width;
            y = (self.y - origin.y + self.height/2) / origin.height;
            concepts[name].x = x;
            concepts[name].y = y;
            $("#concept-padding-" +id).remove();
            red = Math.floor(x * 200);
            blue = Math.floor(y * 200);
            if (concepts[name].dropped) {
                $("#completed-concepts li[concept-id="+id+"] span").first().css({"background-color" : "rgb("+red+","+blue+",128)"});
            } else {
                $("#completed-concepts").append("<li concept-id='"+id+"'><span class='badge' style='background-color:rgb("+red+","+blue+",128)'>"+name+"</span><span>"+comment+"</span></li>");
            }
            concepts[name].dropped = true;
            layoutCurrentConcepts();
        }});
    concept.click(function() {
        if (concepts[name].dropped) {
            $("#concept-dialog").dialog("option", "title", name);
            $("#concept-dialog").dialog("option", "position", {
                "my" : "right-10% bottom-10%",
                "of": "horizontal",
                "collision": "flip",
                "of" : concepts[name].ref
            });
            $("#concept-dialog textarea").val(concepts[name].comment);
            $("#concept-dialog").attr("concept-id", id);
            $("#concept-dialog").dialog("open");
        }
    });
    function sleep(ms) {
      var start = new Date().getTime(), expire = start + ms;
      while (new Date().getTime() < expire) { }
      return;
    }
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