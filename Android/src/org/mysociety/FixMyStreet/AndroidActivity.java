package org.mysociety.FixMyStreet;

import android.os.Bundle;
import org.apache.cordova.*;

public class AndroidActivity extends DroidGap {
    /** Called when the activity is first created. */
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        super.setIntegerProperty("splashscreen", R.drawable.splash);
        super.loadUrl("file:///android_asset/www/src/index.html", 30000);
    }
}