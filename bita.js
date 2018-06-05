//Some linear algebra functions
//Colin 19-4-2017
var portlab = '';

function dsum(n, x, xbase, incx) {
    //Sum array start at index xbase with jumps of incx
    var sum = 0.0
      , i = xbase;
    while (n--) {
        sum += x[i];
        i += incx;
    }
    return sum;
}
function dsumvec(n, x) {
    //Sum array
    return dsum(n, x, 0, 1);
}
function didot(n, x, xbase, ix, y, ybase, iy) {
    var sum = 0.0
      , i = xbase
      , j = ybase;
    if (n) {
        if (ix) {
            while (n--) {
                sum += x[i] * y[j];
                j += iy;
                i += ix++;
            }
        } else
            sum = x[i + xbase] * dsum(n, y, ybase, iy);
    }
    return sum;
}
function ddot(n, x, xbase, ix, y, ybase, iy) {
    //Scalar product starting at xbase and ybase with jumps ix and iy
    var sum = 0.0
      , i = xbase
      , j = ybase;
    while (n--) {
        sum += x[i] * y[j];
        i += ix;
        j += iy;
    }
    return sum;
}
function ddotvec(n, x, y) {
    //Scalar product
    return ddot(n, x, 0, 1, y, 0, 1);
}
function dsmxmulv(n, S, x, y) {
    //Multiply symmetric matrix stored in packed form by a vector
    var i = 0
      , is = 0
      , j = 0
      , Sbase = 0
      , xbase = 0;
    for (i = 1,
    j = 0; i <= n; i++,
    j++,
    Sbase += i,
    xbase++) {
        y[j] = ddot(i, S, Sbase, -1, x, xbase, -1) + didot(n - i, S, i + Sbase, i + 1, x, xbase + 1, 1);
    }
}
function dadd(n, a, abase, ia, b, bbase, ib, c, cbase, ic) {
    var i = abase
      , j = bbase
      , k = cbase;
    while (n--) {
        c[k] = a[i] + b[j];
        i += ia;
        j += ib;
        k += ic;
    }
}
function dsub(n, a, abase, ia, b, bbase, ib, c, cbase, ic) {
    var i = abase
      , j = bbase
      , k = cbase;
    while (n--) {
        c[k] = a[i] - b[j];
        i += ia;
        j += ib;
        k += ic;
    }
}
function daddvec(n, a, b, c) {
    dadd(n, a, 0, 1, b, 0, 1, c, 0, 1);
}
function dsubvec(n, a, b, c) {
    dsub(n, a, 0, 1, b, 0, 1, c, 0, 1);
}
function risk(n, S, w, bench) {
    var rel = []
      , implied = [];
    dsubvec(n, w, bench, rel);
    dsmxmulv(n, S, rel, implied);
    return Math.sqrt(ddotvec(n, rel, implied));
}
////////////////////////////////////////////////////////////////

//Process data from a text file
//              Colin 11-4-2017
//

function getData(lines) {
    var daryl_original = false;
    portlab = '';
    //Don't need the original code any more
    var n = lines.length;
    var i;
    var datac = [];
    //current
    var datap = [];
    //proposed
    var data = [];
    var line;
    var prop, curr, fac;
    var obj = 0;
    var startup = 1;
    var colours = ["grey"];
    var nport = 2
      , iport = 0
      , dataport = []
      , colourset = false;
    var j = 0;
    for (i = 0; i < n; ++i) {
        if (lines[i].match(/^,*$/))
            continue;
        //get rid of ,,,,,,,,,,,,,
        lines[i] = lines[i].replace(/^,*/, "");
        //get rid of leading ,,,,				
        lines[i] = lines[i].replace(/,*$/, "");
        //get rid of trailing ,,,,		
        line = lines[i].split(",");
        if (daryl_original && line.length == 3) {
            //Daryl's original data
            colours = ["grey", "blue"];
            nport = 2;
            if (startup && (lines[i].match(/Factor/) || lines[i].match(/Current/) || lines[i].match(/Proposed/))) {
                //This allows for a different ordering
                if (line[0] == "Factor")
                    fac = 0;
                else if (line[1] == "Factor")
                    fac = 1;
                else if (line[2] == "Factor")
                    fac = 2;
                if (line[0] == "Current")
                    curr = 0;
                else if (line[1] == "Current")
                    curr = 1;
                else if (line[2] == "Current")
                    curr = 2;
                if (line[0] == "Proposed")
                    prop = 0;
                else if (line[1] == "Proposed")
                    prop = 1;
                else if (line[2] == "Proposed")
                    prop = 2;
                startup = 0;
            } else {
                //required data is an array of 2 arrays of objects
                datac[obj] = {};
                datac[obj].axis = line[fac];
                if (line[curr].match(/%/))
                    datac[obj].value = line[curr].replace("%", "") / 100;
                else
                    datac[obj].value = line[curr];
                datap[obj] = {};
                datap[obj].axis = line[fac];
                if (line[prop].match(/%/))
                    datap[obj].value = line[prop].replace("%", "") / 100;
                else
                    datap[obj].value = line[prop];
                obj++;
            }
        } else {
            if (i == 0) {
                nport = line.length - 1;
                for (j = 0; j < nport; ++j) {
                    portlab += line[j + 1] + ',';
                }
                portlab = portlab.replace(/,$/, '');
                portlab += '<br>';
            } else if (line[0].match(/olour/)) {
                for (j = 0; j < nport; ++j) {
                    colours[j] = line[j + 1];
                    portlab += line[j + 1].toLowerCase() + ' ';
                }
                colourset = true;
            } else if (line.length == nport + 1) {
                for (iport = 0; iport < nport; ++iport) {
                    dataport[obj * nport + iport] = {};
                    dataport[obj * nport + iport].axis = line[0];
                    dataport[obj * nport + iport].value = line[1 + iport];
                    if (dataport[obj * nport + iport].value.match(/%/))
                        dataport[obj * nport + iport].value = line[1 + iport].replace("%", "") / 100;
                }
                obj++;
            }
        }
    }

    if (!daryl_original || nport != 2) {
        for (i = 0; i < nport; ++i)
            data[i] = [];
        for (i = 0; i < nport; ++i) {
            for (j = 0; j < obj; ++j) {
                data[i].push(dataport[j * nport + i]);
            }
        }
        if (!colourset) {
            for (j = 0; j < nport; ++j) {
                colours[j] = "blue"
            }
            colours[0] = "grey";
        }
    } else
        data = [datac, datap];

    ////////////////////////////////////////////////////////////// 
    //////////////////////// Set-Up ////////////////////////////// 
    ////////////////////////////////////////////////////////////// 

    var margin = {
        top: 100,
        right: 100,
        bottom: 100,
        left: 100
    }
      , width = Math.min(700, window.innerWidth - 10) - margin.left - margin.right
      , height = Math.min(width, window.innerHeight - margin.top - margin.bottom - 20);

    ////////////////////////////////////////////////////////////// 
    //////////////////// Draw the Chart ////////////////////////// 
    ////////////////////////////////////////////////////////////// 

    var colour = d3.scaleOrdinal().range(colours);

    var radarChartOptions = {
        w: width,
        h: height,
        margin: margin,
        maxValue: 0.5,
        levels: 5,
        roundStrokes: true,
        color: colour
    };
    //Call function to draw the Radar chart
    RadarChart(".radarChart", data, radarChartOptions);

}
function loadFile(datafile) {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            var lines = this.responseText.split("\n");
            getData(lines);
        }
    }
    ;
    xhttp.open("GET", datafile, true);
    xhttp.send();
}
function loadFiled3(datafile) {
	var err=0;
    //d3.text(datafile, function(error, text) {
    d3.text(datafile).then( function(text) {
        var lines = text.split('\n');
        getData(lines);
    });
    return err;
}
var openFile = function(event) {
    //for testing locally using files on the client
    var input = event.target;
    var reader = new FileReader();
    reader.onload = function() {
        var text = reader.result;
        var lines = text.split('\n');
        getData(lines);
        var out = document.getElementById("lab1");
        var list = document.getElementById("listfile");
        var tt = out.style.textAlign;
        out.innerHTML = '<br>';
        out.innerHTML += portlab + '<br>';
        if (list.value == 'list') {
            out = document.getElementById("lab2");
            out.style.fontFamily = 'Courier';
            out.style.textAlign = 'left';
            out.style.fontSize = '12px';
            out.innerHTML += text.replace(/\n/g, '<br>');
        }
    }
    reader.readAsText(input.files[0]);
};
