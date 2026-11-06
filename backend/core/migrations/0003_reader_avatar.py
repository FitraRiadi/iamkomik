from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("core", "0002_reader_user"),
    ]

    operations = [
        migrations.AddField(
            model_name="reader",
            name="avatar",
            field=models.TextField(blank=True, default=""),
        ),
    ]
