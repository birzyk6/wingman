# Generated by Django 5.1.7 on 2025-03-25 15:29

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0003_wingmanusers'),
    ]

    operations = [
        migrations.AddField(
            model_name='wingmanusers',
            name='password',
            field=models.TextField(default='defaukt', max_length=100),
            preserve_default=False,
        ),
        migrations.AlterField(
            model_name='wingmanusers',
            name='age',
            field=models.IntegerField(),
        ),
    ]
