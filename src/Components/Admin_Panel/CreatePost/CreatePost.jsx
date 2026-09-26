import { useState } from "react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import "./CreatePost.css";

// 👇 Toolbar options — Word jaisa formatting
const QUILL_MODULES = {
    toolbar: [
        [{ header: [1, 2, 3, false] }],
        ["bold", "italic", "underline", "strike"],
        [{ color: [] }, { background: [] }],
        [{ list: "ordered" }, { list: "bullet" }],
        [{ align: [] }],
        ["blockquote", "link"],
        ["clean"],
    ],
};

export default function CreatePost() {
    const [heading, setHeading] = useState("");
    const [description, setDescription] = useState("");
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);

    const handleFileChange = (e) => {
        const selected = e.target.files?.[0] || null;
        setFile(selected);

        if (selected && selected.type.startsWith("image/")) {
            setPreview(URL.createObjectURL(selected));
        } else {
            setPreview(null);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // description ab HTML format mein aayega (jaise <p><strong>bold text</strong></p>)
        const formData = new FormData();
        formData.append("heading", heading);
        formData.append("description", description);
        if (file) formData.append("attachment", file);

        console.log("Form Data:", { heading, description, file });

        // Reset form
        setHeading("");
        setDescription("");
        setFile(null);
        setPreview(null);
        e.target.reset();
    };

    return (
        <div className="cp-page-wrapper">
            <h1 className="cp-title">Create Post</h1>

            <form className="cp-form" onSubmit={handleSubmit}>
                <div className="cp-field">
                    <label htmlFor="heading">Heading <span className="cp-req">*</span></label>
                    <input
                        id="heading"
                        type="text"
                        placeholder="Enter heading"
                        value={heading}
                        onChange={(e) => setHeading(e.target.value)}
                        required
                    />
                </div>

                <div className="cp-field">
                    <label>Description <span className="cp-req">*</span></label>
                    <ReactQuill
                        theme="snow"
                        value={description}
                        onChange={setDescription}
                        modules={QUILL_MODULES}
                        placeholder="Write your description here..."
                        className="cp-quill"
                    />
                </div>

                <div className="cp-field">
                    <label htmlFor="attachment">Image / Video / File</label>
                    <input
                        id="attachment"
                        type="file"
                        accept="image/*,video/*,.pdf,.doc,.docx"
                        onChange={handleFileChange}
                    />
                    {file && <span className="cp-file-name">📎 {file.name}</span>}
                    {preview && (
                        <img src={preview} alt="Preview" className="cp-preview" />
                    )}
                </div>

                <button type="submit" className="cp-submit-btn">Submit</button>
            </form>
        </div>
    );
}