import cloudinary.uploader


def attachment_resource_type(attachment):
    if attachment.file_type and "pdf" in attachment.file_type.lower():
        return "raw"
    return "image"


def delete_attachment_file(attachment):
    if not attachment or not attachment.public_id:
        return

    cloudinary.uploader.destroy(
        attachment.public_id,
        resource_type=attachment_resource_type(attachment),
    )


def delete_attachment_files(attachments):
    for attachment in list(attachments or []):
        try:
            delete_attachment_file(attachment)
        except Exception:
            pass
