# Design Tutorial Annotation

A web application built for professional designers to annotate creative knowledge in design tutorials. The backend is built using Flask. To launch the service:

* Define ABSOLUTE_PATH, ANNOTATION_PATH, and HTML_PATH values inside `engine.py`.

* Execute `python engine.py`

To access and annotation a web page, using the following URL template:

```
http://[Server IP Address]:8888/task?workerId=[Worker ID]&assignmentId=[Assignment ID]&hitId=[hit ID]&doc=[Doc ID]
```
