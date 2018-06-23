var out_id = '#sentence_selection_display';
var selectedText;
var step_max = 1;
var active_selection = true;
var ann_dict = {};

var remove_highlights = function(){
    // remove highlights
    if (window.getSelection().empty) {  // Chrome
        window.getSelection().empty();
    } else if (window.getSelection().removeAllRanges) {  // Firefox
        window.getSelection().removeAllRanges();
    }
};

var get_text_selection = function(event){
        
    selectedText = window.getSelection().toString();

    if(selectedText.length > 0){
        $(out_id).html('<span style="color:red;">selected sentences: </span>' + selectedText);
    } else {
        $(out_id).html('(The selected sentences will display here after confirmation)');
    }
    
    remove_highlights();
};

var get_finished_text = function(step_count, command, sentences, summary){

    return '<div class="e_' + step_count + '"><p><span style="color:red;">command: </span>' + command + 
        '. <span style="color: red;">selected sentences: </span>' + sentences + 
        '. <span style="color: red;">summary: </span>' + summary + '.</p><button type="button" class="exp_buttons delete" step_c="'+ step_count + '">Delete this command.</button><button type="button" class="exp_buttons edit" step_c="'+ step_count + '">Edit this command.</button><button type="button" class="exp_buttons add_a_command_above" step_c="'+ step_count + '">Add a command above.</button><button type="button" class="exp_buttons add_a_command_below" step_c="'+ step_count + '">Add a command below.</button><hr></div>';
    
};

var get_selection_tool = function(step_count, data_options){

    return '<div class="t_' + step_count + '"><p class="remove-all-styles" id="sentence_selection_display">(The selected sentences will display here after confirmation)</p><p class="remove-all-styles"><button type="button" class="exp_buttons" id="confirm_sentence_selection">Confirm the sentences selection.</button></p><select data-placeholder="Choose a command..." class="chosen-select" tabindex="2">' + data_options + '</select><p class="remove-all-styles"><input type="text" name="mannual_command" placeholder="Enter the command manually" size="20" id="command_box"></p><p class="remove-all-styles"><input type="text" name="command_usage" class="limit_input" placeholder="Describe its usage (10 words maximum)" size="50" id="usage_box"></p><button type="button" class="exp_buttons" step_c="'+ step_count + '" id="command_submit">Submit.</button><hr></div>';
    
};

$(document).ready(function(){
    
    $('.limit_input').on('keydown', function(e){
        var words = $.trim(this.value).length? this.value.match(/\S+/g).length : 0;
        if (words > 10){
            if (e.which !== 8) e.preventDefault();
        }
    });
    
    $('#is_tutorial_yes').click(function(event){
        $('#yes_no').hide();
        $('#title').show();
    });
    
    $('#is_tutorial_no').click(function(event){
        $('#is_tutorial_no').attr('disabled', true);
        $.post('/refresh',
                   {'workerId': workerId,
                    'assignmentId': assignmentId,
                    'hitId': hitId,
                    'doc': doc}).done(function(data){
    window.location.replace('/task?workerId=' + workerId + '&assignmentId=' + assignmentId + '&hitId=' + hitId + '&doc=' + data);
                    });
    });
    
    $('#final_submit').click(function(event){
        $('#final_submit').attr('disabled', true);
        $.post('/submit',
                       {'workerId': workerId,
                        'assignmentId': assignmentId,
                        'hitId': hitId,
                       'doc': doc,
                       'ann_dict': JSON.stringify(ann_dict)}).done(function(data){
                          if(data == 'success'){
                              window.location.replace('/task?workerId=' + workerId + '&assignmentId=' + assignmentId + '&hitId=' + hitId);
                          }
                        });
    
    });
    
    $('#title_submit').click(function(event){
        selectedText = window.getSelection().toString();
        if(selectedText.length == 0){
            alert("Invalid submission.");
            return;
        }
        ann_dict['title'] = selectedText;
        $('#title').hide();
        $('#goal').show();
        remove_highlights();
    });
    
    $('#title_no').click(function(event){
        $('#title').hide();
        $('#goal').show();
        ann_dict['title'] = '';
    });
    
    $('#goal_submit').click(function(event){
        selectedText = window.getSelection().toString();
        if(selectedText.length == 0){
            alert("Invalid submission.");
            return;
        }
        $('#goal').hide();
        $('#goal_summarize').show();
        ann_dict['goal'] = selectedText;
        remove_highlights();
    });
    
    $('#goal_no').click(function(event){
        $('#goal').hide();
        $('#goal_summarize').show();
        ann_dict['goal'] = '';
    });
    
    $('#summarize_goal_submit').click(function(event){
        var summary = $('input[name=summarize_goal_text]')[0].value;
        if(summary.length == 0){
            alert("Invalid submission.");
            return;
        }
        $('#goal_summarize').hide();
        ann_dict['goal_summary'] = summary;
        
        $('#command_instruction').show();
        $('#command_section').show();
        $('#command_section').append(get_selection_tool(1, data_options));
        
        $('.limit_input').on('keydown', function(e){
            var words = $.trim(this.value).length? this.value.match(/\S+/g).length : 0;
            if (words > 10){
                if (e.which !== 8) e.preventDefault();
            }
        });
        
        document.getElementsByClassName('chosen-select')[0].onchange = function(){
            console.log(this.options[this.selectedIndex].value);
            if(this.options[this.selectedIndex].value == "Missing command"){
                $('#command_box').show();
            }else{
                $('#command_box').hide();
            }
        };
        
        $('#command_box').hide();
        $('.chosen-select').chosen({});

        $('#confirm_sentence_selection').click(get_text_selection);
        
        var command_submit_func = function(event){
        
            var select_target = $('.chosen-select')[0];
            var command = select_target.options[select_target.selectedIndex].value;
            
            if(command == "Missing command"){
                command = $('input[name=mannual_command]')[0].value;
            }
            
            var sentences = selectedText;
            var summary = $('input[name=command_usage]')[0].value;
            
            // Abandan invalid submission
            if(sentences.length == 0 || summary.length == 0 || command.length == 0){
                alert("Invalid submission.");
                return;
            }
            var result_dict = {'command': command, 'sentences': sentences, 'summary': summary};
            var current_step = parseInt($(event.target).attr('step_c'));
            ann_dict[current_step] = result_dict;
            
            $('.t_' + current_step).replaceWith(get_finished_text(current_step, result_dict['command'], 
                                                           result_dict['sentences'], result_dict['summary']));

            active_selection = false;
            $('#final_submit').attr('disabled', false);
            
            $('.delete').unbind('click').click(function(event){
                if(!active_selection && step_max > 1){
                    var current_step = parseInt($(event.target).attr('step_c'));
                    
                    $('.e_' + current_step).remove();
                    
                    for(var i = current_step + 1; i <= step_max; i++){
                        $('.e_' + i + ' > button').attr('step_c', String(i-1));
                        $('.e_' + i).attr('class', 'e_' + (i-1));
                        ann_dict[i-1] = ann_dict[i];
                    }
                    
                    delete ann_dict[step_max];
                    step_max = step_max - 1;
                }
            });

            $('.edit').unbind('click').click(function(event){
                if(!active_selection){
                    console.log(event.target);
                    var current_step = parseInt($(event.target).attr('step_c'));

                    $('.e_' + current_step).replaceWith(get_selection_tool(current_step, data_options));
                    $('#command_box').hide();
                    $('.chosen-select').chosen({});
                    document.getElementsByClassName('chosen-select')[0].onchange = function(){
                        console.log(this.options[this.selectedIndex].value);
                        if(this.options[this.selectedIndex].value == "Missing command"){
                            $('#command_box').show();
                        }else{
                            $('#command_box').hide();
                        }
                    };
                    
                    $('#confirm_sentence_selection').unbind('click').click(get_text_selection);
                    $('#command_submit').unbind('click').click(command_submit_func);
                    $('.limit_input').on('keydown', function(e){
                        var words = $.trim(this.value).length? this.value.match(/\S+/g).length : 0;
                        if (words > 10){
                            if (e.which !== 8) e.preventDefault();
                        }
                    });
                    active_selection = true;
                }
            });

            $('.add_a_command_above').unbind('click').click(function(event){
                if(!active_selection){
                    var current_step = parseInt($(event.target).attr('step_c'));

                    for(var i = step_max; i >= current_step; i--){
                        $('.e_' + i + ' > button').attr('step_c', String(i+1));
                        $('.e_' + i).attr('class', 'e_' + (i+1));
                        ann_dict[i+1] = ann_dict[i];
                    }
                    step_max = step_max + 1;

                    $('.e_' + (current_step+1)).before(get_selection_tool(current_step, data_options));

                    $('#command_box').hide();
                    $('.chosen-select').chosen({});
                    document.getElementsByClassName('chosen-select')[0].onchange = function(){
                        console.log(this.options[this.selectedIndex].value);
                        if(this.options[this.selectedIndex].value == "Missing command"){
                            $('#command_box').show();
                        }else{
                            $('#command_box').hide();
                        }
                    };

                    $('#confirm_sentence_selection').unbind('click').click(get_text_selection);
                    $('#command_submit').unbind('click').click(command_submit_func);
                    $('.limit_input').on('keydown', function(e){
                        var words = $.trim(this.value).length? this.value.match(/\S+/g).length : 0;
                        if (words > 10){
                            if (e.which !== 8) e.preventDefault();
                        }
                    });
                    active_selection = true;
                }
            });

            $('.add_a_command_below').unbind('click').click(function(event){
                if(!active_selection){
                    var current_step = parseInt($(event.target).attr('step_c'));
                    for(var i = step_max; i >= current_step+1; i--){
                        $('.e_' + i + ' > button').attr('step_c', String(i+1));
                        $('.e_' + i).attr('class', 'e_' + (i+1));
                        ann_dict[i+1] = ann_dict[i];
                    }
                    step_max = step_max + 1;
                    $('.e_' + current_step).after(get_selection_tool(current_step + 1, data_options));

                    $('#command_box').hide();
                    $('.chosen-select').chosen({});
                    document.getElementsByClassName('chosen-select')[0].onchange = function(){
                        console.log(this.options[this.selectedIndex].value);
                        if(this.options[this.selectedIndex].value == "Missing command"){
                            $('#command_box').show();
                        }else{
                            $('#command_box').hide();
                        }
                    };

                    $('#confirm_sentence_selection').unbind('click').click(get_text_selection);
                    $('#command_submit').unbind('click').click(command_submit_func);
                    $('.limit_input').on('keydown', function(e){
                        var words = $.trim(this.value).length? this.value.match(/\S+/g).length : 0;
                        if (words > 10){
                            if (e.which !== 8) e.preventDefault();
                        }
                    });
                    active_selection = true;
                }
            });
        };

        $('#command_submit').unbind('click').click(command_submit_func);
    });
    
});


