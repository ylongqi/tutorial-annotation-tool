from flask import g, Flask, request, send_from_directory
from flask import jsonify, render_template
from bs4 import BeautifulSoup, Tag
import json

ABSOLUTE_PATH = 'Absolute path of the tutorial_annotation_tool folder'
ANNOTATION_PATH = 'Folder to store annotations'
HTML_PATH = 'Folder that stores original HTML files'

STATIC_PATH = ABSOLUTE_PATH + '/static'

def get_file(index):
    global HTML_PATH
    with open(HTML_PATH + 'w_' + str(index) + '.html', 'r') as fin:
        return fin.read()

def process_doc(workerId, assignmentId, hitId, doc, options):
    
    soup = BeautifulSoup(get_file(doc), 'html.parser')
    
    if soup.head is None:
        h_str = ''
    else:
        h_str = u''.join([unicode(i) for i in soup.head.contents if isinstance(i, Tag)])

    if soup.body is None:
        b_str = ''
    else:
        b_str = u''.join([unicode(i) for i in soup.body.contents if isinstance(i, Tag)])
    
    return render_template('template_left_right.html', h_str=h_str, b_str=b_str, workerId=workerId, assignmentId=assignmentId, hitId=hitId, doc=doc, options=options.replace('\r', '').replace('\n', '').replace("'", "\\'"))
    
app = Flask(__name__, static_url_path=STATIC_PATH)

@app.route('/task', methods = ['GET'])
def task():
    global ABSOLUTE_PATH
    if 'workerId' in request.values and 'assignmentId' in request.values and \
        'hitId' in request.values and 'doc' in request.values:
        workerId = request.values['workerId']
        assignmentId = request.values['assignmentId']
        hitId = request.values['hitId']
        doc = int(request.values['doc'])
        with open(ABSOLUTE_PATH + '/commands_option.txt', 'r') as fin:
            options_text = fin.read()
        return process_doc(workerId=workerId, 
                               assignmentId=assignmentId, hitId=hitId, 
                               doc=doc, options=options_text)
    else:
        return 'Invalid request to access the content.'

@app.route('/submit', methods = ['POST'])
def submit():
    global ANNOTATION_PATH
    if 'workerId' in request.values and 'assignmentId' in request.values and 'hitId' in request.values \
        and 'doc' in request.values and 'ann_dict' in request.values:
        
        workerId = request.values['workerId']
        assignmentId = request.values['assignmentId']
        hitId = request.values['hitId']
        doc = request.values['doc']
        
        ann_dict = dict()
        ann_dict['workerId'] = workerId
        ann_dict['assignmentId'] = assignmentId
        ann_dict['hitId'] = hitId
        ann_dict['doc'] = doc
        ann_dict['ann_dict'] = json.loads(request.values['ann_dict'])

        with open(ANNOTATION_PATH + '/d_%s.json' % str(request.values['doc']), 'w') as fout:
            json.dump(ann_dict, fout)
        
    else:
        return 'invalid request.'

@app.route('/js/<path:path>')
def send_js(path):
    return send_from_directory('static/js', path)

@app.route('/css/<path:path>')
def send_css(path):
    return send_from_directory('static/css', path)

if __name__ == '__main__':
    app.run(threaded=True, host='0.0.0.0', port=8888)
