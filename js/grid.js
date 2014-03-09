concepts = {}
concept_ids = {}

function unsetConcept(id) {
    name = concept_ids[id];
    delete concepts[name];
    delete concept_ids[id];
    $("#concept-" + id).remove();
}

function resizeCSGrid() {
    $(".cs-grid").height($(window).height());
    origin = getBoundingBox(".cs-grid");
    for (concept in concepts) {
        ref = concepts[concept].ref;
        self = getBoundingBox(ref);
        $(ref).offset({"left": origin.x + concepts[concept].x * origin.width - self.width/2,
                       "top": origin.y + concepts[concept].y * origin.height - self.height/2});
    }
}

function getBoundingBox(obj) {
    return {"x" : $(obj).offset().left,
            "y" : $(obj).offset().top,
            "width" : $(obj).width(),
            "height" : $(obj).height()};
}

function buildConceptDialog() {
    $("#concept-dialog").dialog({
        autoOpen: false,
        title: "Unknown",
        buttons: [
            {text : "Delete", click: function() {
                id =  $("#concept-dialog").attr("concept-id");
                unsetConcept(id);
                $(this).dialog("close");
            }},
            {text : "Okay", click: function() {
                $(this).dialog("close");
            }}
        ]
    });
}

function createNewDraggableConcept(name, id, comment) {
    concept_ids[id] = name;
    concept = $("<span id='concept-"+id+"' class='concept'>"+name+"</span>");
    concept.dblclick(function() {
        $("#concept-dialog").dialog("option", "title", name);
        $("#concept-dialog textarea").val(comment);
        $("#concept-dialog").attr("concept-id", id);
        $("#concept-dialog").dialog("open");
    });
    concept.draggable({
        distance: 10,
        scroll: false,
        drag: function() {
            $(this).css({"font-weight": "bold"});
        },
        stop: function() {
            $(this).css({"font-weight": "normal"});
            self = getBoundingBox(this);
            origin = getBoundingBox(".cs-grid");
            newX = self.x;
            newY = self.y;
            x = (self.x - origin.x) - self.width / 2;
            y = (self.y - origin.y) - self.height / 2;
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
                $(this).offset({"top": newY, "left": newX});
            }
            self = getBoundingBox(this);
            concepts[name] = {"x": (self.x - origin.x + self.width/2) / origin.width,
                              "y": (self.y - origin.y + self.height/2) / origin.height,
                              "ref": "#concept-"+id,
                              "name": name,
                              "id": id};
        }});
    $("#concepts").append(concept);
}

$(document).ready(function() {
    window.onresize = resizeCSGrid;
    resizeCSGrid();
    buildConceptDialog();
    createNewDraggableConcept("Closures", 1);
    createNewDraggableConcept("Pointers", 100);
    createNewDraggableConcept("Reading from a file", 77);
    createNewDraggableConcept("Local variables vs. global variables", 870);
});