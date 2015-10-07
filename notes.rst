COEN 148/290: Computer Graphics
=============================

Syllabus
------------
Yuan Wang
ywang6@scu.edu
Office 323H in Banan
Hours: 12-2pm or by appointment

Grade:
    70% homework
    30% final

Homework will be 4 or 5 programs
    Each one is 15% of grade...

Text
    Computer Graphics: Principles and Practice

What is Computer Graphics
-------------------------

Use of computer to crate images based on 2D/3D information

The information is create too (matheatically defined or collected from real world)

Computer Graphics Application
------------------------------
* Digital Art
* Movies
* Design
* Medical
* Animation 
* Games
* Science

History
-------
Euclid came up with the basic geometry
    Creating a dodecahedron out of a cube

Cathode Ray Tube
    1907 - Boris Rosing turns radio signal into picture

1926 - Takayanagi demonstrated a TV with 40 CRTs, but did not file patent

Oscilloscope (1950) with cathode ray tubes used to create digital art by setting the oscilloscope to different cosine/sine equations

Vectorscope is a special type of oscilloscope used both in autho and video applications

1955, US military created "Light Gun" to interact with system via a monitor

William Fetter in 1960 coined the term computer graphics while modeling for Boeing

Sutherland, 1963 invented Sketchpad system on TX-2
    line, curve, shape
    copy move and resize
    Object oriented conecpt
    Vector display


Line Drawing Algorithms
------------------------
One algorithm is to pick the pixels that are closest to the line we want to draw.  Calculated ideal y-value from the x values along the path, and then find the closest pixel to the ideal.  

Requires that we know the *slope* of the line:
    - If the slope is less than 1, sample x and calculate y
    - If slope is GREATER than 1, sample y and calculate x.

Circle Drawing Algorithm
-------------------------
Sample the x value and calculate the associated y-value.
But you only have to do an eight of the x values, because the entire circle is symetric.
Once you have the first eighth, the rest is calculated by applying quick transforms.

How do we tell if the pixel is inside or outside the circle:
    x^2 + y^2 - R^2 < 0 ----> inside
    x^2 + y^2 - R^2 > 0 ----> outside

Midpoint Algorithm
~~~~~~~~~~~~~~~~~~~~
If you have a pixel (xp, yp) then:
    * E = (xp+1, yp)
    * SE = (xp+1, yp-1)
    * M = (xp+1, yp - 1/2)

Check if M is inside the circle, then use point #, if it is outside use SE.  If M is inside, then the circle passed between M and E

You can also use the first midpoint to calculate the next one:
    if M is below the circle, then the next middle point is one over.  If it is above the cirle, the next middle point is one over and below.

.. note::
    Midpoint refers to the point between two pixels.

Equation for if F(M) is inside circle: 
    F(p) = x^2+y^2 - R^2        #calculate point.  Positive is outside circle, negative is inside circle
    F(M_e) - F(M) = 2*x_p + 3   #The next midpoint - current midpoint is equal to 2 * the original point + 3

    F(M_e) = 2x_p + 3 + F(M)    #this tells us if the next midpoint (to the east) is going to be inside or outside the circle

From a single midpoint you can calculate the location of all the midpoints, and then from there, you can chose the closest pixel by applying F(M).
If F(M) is greater than 0, take the point above the midpoint.  If it is less than 0 take the point below the midpoint.

Equation for if F(M) is outside circle:
    F(M_se) - F(M) = 2x_p - 2y_p + 5
    F(M_se) = 2x_p - 2y_p + 5 + F(M)

So if we start from the top point on the circle:
    F(M), d = 5/4 - R, x0 = 0, y0 = R where d is the inital midpoint

    #keep calculating until x is equal to y,
    #at which point we have calculated 1/8 of the circle
    while x < y:
        #inside circle
        if d < 0:
            d += 2x + 3
            x += 1          #increment x by 1 to check the next pixel on the x axis
            y = y           #we are still in the correct y range
        #outside circle 
        else:
            d += 2x -2y + 5 
            x = x + 1       #increment x by 1
            y = y + 1       #icrement y by 1 as well

Line Width
-------------
Standard line is generated with single pixel width, and then add pixels adjacent.

If line is horizontal, then add more pixels in the y direction (which way?).
Vertial line is just the opposite.

If line has a slope < 1, then add pixels in the *y* direction.
If slope is > 1, then add pixels in *x*direction

Minor Issue: lines at a 45 degree angle.
    The line will have different slopes across its body.  Even though the line may have a width of 5, the width across at a certain point may be less than 5.

Other issue: Line endings
    Butt Cap: lines end with single point no matter the width
    Round cap: round the edges of the end of the line
    Project square cap: make the line slighlty longer than intended

Dashed, Dotted, dot-dashed
    Have to skip a number of pixels.  Use a "mask" to define how many pixels to go before skipping and then apply the mask to the line

Length
    A horizontal line that is 5 pixels long is going to be shorter than a horizontal line that is 5 pixels long.

Anti-Aliasing
-------------
Aliasing: jagged/stair-step appearance of objects due to the fact that rater displays are only an approximation of the mathematical primities using pixels

Pixels used to approx the real line have different extent of "closeness" with the rel line.  If we could find a way to represent this "closeness" then we could assign different color values to different pixels.  The closer the pixel, the higher the color intensity of the pixel.  Creates a blurred effect where the pixels towards the outside are lighter.

How to meausre closeness
~~~~~~~~~~~~~~~~~~~~~~~~

Super-sampling
^^^^^^^^^^^^^^^^^^
each pixel is a square and is divided into 9 sub pixels.  Then calculate how many sub-pixels touch the line.  The intensity of the pixel will be proportional to this count.

.. note::
    You have to consider lines with width.  The mathematical line does not have a width, but our drawings usually do.

With super-sampling, you can then set sub weights within each pixel for each subpixel.

Area-Overlap
^^^^^^^^^^^^^^^^
Calculate what area of the pixel falls along the line.  The greater the area, the higher the intensity

Polygon Filling
----------------
Two different filling algorithms:
    - scan line fill: find intersection of scan-line and boundary
    - seed fill / flood fill: start filling from inside till reach the boundary

Scan Line Fill
~~~~~~~~~~~~~~~~
Works well for convex polygons.

Calculate intersection pixels and fill in-between pixels.

Concave Polygon
^^^^^^^^^^^^^^^
Find all intersection points, and then connect between each set.  They are not always pairwise though.  
If you have an odd number, one of them will need to be used twice.

You don't want to count points twice.  We want to separate the common pixel.
If the Y value of the two end points of the two edges are monotonically increasing or decreasing we either shorten upper endpoint's Y of the current edge or decrease upper endpoints of the next edge.

Seed Fill/Flood Fill
~~~~~~~~~~~~~~~~~~~~~
Start with a pixel inside and recursively check its neighboring pixels.



Clipping
----------

Point Clipping
~~~~~~~~~~~~~~~
Coordinate system.  Set clipping window.  If point falls in box, draw it, otherwise, don't.

Line Clipping
~~~~~~~~~~~~~~~~
Have a line, set clipping window.  Only show the points that are within the window.

>>> m = (y_end-y0)/(x_end-x0)
>>> y = y0 + m(x-x0)

But it is easier to do some preprocessing logic rather than finding the points of intersection of the line and the window.

If P1 and P2 are the ends of the line then:
    if P1 and P2 are both in the window, then we can keep the entire line
    if P1 and P2 are both outside the window, we have to decide:
