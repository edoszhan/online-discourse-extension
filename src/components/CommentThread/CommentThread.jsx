import React from 'react';

function CommentThread({thread}) {
    return(
        <div className="comment-section css-s2htvn" style={{display: 'flex', flexDirection: 'column', width: "100%"}}>
            <div style={{padding: "15px"}}>{thread}</div>
            <div className="comments" style={{ width: '100%' }}>
                <div className="comments-list" 
                     style={{display:"flex", alignItems: "center", justifyContent: "center", width: '100%', height: "400px", margin: "10px", backgroundColor: "#E9E9E9" }}
                >
                    No Comments
                </div>
                <textarea id="new-comment" 
                          placeholder="Add a comment..." 
                          style={{ width: '100%', height: "100px", margin: "10px", border: "1px solid #E9E9E9" }}
                >
                </textarea>
                <button className="add-comment" 
                        style={{color: 'white', backgroundColor: 'blue', width: '120px', height: '45px', margin: "10px", fontSize: "14px", borderRadius: "16px"}}
                >
                    Add Comment
                </button>
            </div>
        </div>
    )
}

export default CommentThread;