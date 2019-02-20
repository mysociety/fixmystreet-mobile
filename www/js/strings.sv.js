(function (FMS, _) {
    _.extend( FMS, {
        validationStrings: {
            update: 'Fyll i detaljer kring problemet',
            title: 'Ange en titel',
            detail: 'Fyll i detaljer kring problemet',
            name: {
                required: 'Ange ditt namn',
                validName: 'Ange ditt fullständiga namn - bocka i alternativet nedan om namnet inte ska visas offentligt på FixaMinGata'
            },
            category: 'Sparad i %s-kategorin',
            rznvy: {
                required: 'Ange din e-postadress',
                email: 'Ange en giltlig e-postadress'
            },
            email: {
                required: 'Ange din e-postadress',
                email: 'Ange en giltlig e-postadress'
            },
            password: {
                required: 'Ange ett lösenord',
                short: 'Ange ett lösenord som är minst %d tecken långt'
            }
        },
        strings: {
            next: 'Nästa',
            untitled_draft: 'Namnlöst utkast',
            login_error: 'Det har uppstått ett problem. Vänligen avsluta appen och försök igen.',
            logout_error: 'Det har uppstått ett problem. Vänligen avsluta appen och försök igen.',
            login_details_error: 'Ett problem uppstod vid din inloggning. Vänligen försök igen senare.',
            password_problem: 'Det finns ett problem med din e-post/lösenords-kombination. Om du har glömt ditt lösenord, eller inte har ett, kan ett nytt anges genom att gå via e-postfönstret och välja alternativet lösenord. Lösenord aktiveras när du klickar på länken i ditt bekräftelsemejl.',
            search_placeholder: 'Sök efter en plats eller postnummer',
            location_error: 'Platsfel',
            location_problem: 'Ett problem uppstod i vid fastställande av plats.',
            multiple_locations: 'Mer än en plats hittades. Välj ett av alternativen nedan eller sök på gatunamn och ort, eller postnummer.',
            multiple_matches: 'Flera träffar hittades',
            sync_error: 'Ett fel inträffades när din rapport skickades: ',
            unknown_sync_error: 'Det har uppstått ett problem. Vänligen avsluta appen och försök igen.',
            report_send_error: 'Det har uppstått ett problem. Vänligen avsluta appen och försök igen.',
            missing_location: 'Ange en plats',
            location_check_failed: 'Ett problem uppstod i samband med genomgång av att angiven position stödjs. Vänligen försök igen senare.',
            category_extra_check_error: 'Ett problem uppstod i samband med genomgång av de detaljer som behövs för rapporteringen. Vänligen försök igen senare.',
            locate_dismissed: 'Sök efter ett postnummer eller gatunamn och ort.',
            geolocation_failed: "Tyvärr kunde positionen för din placering inte hittas. Vänligen ange en plats i sökrutan istället",
            geolocation_denied: 'Kunde inte använda platstjänst. Vänligen kontrollera rättigheter.',
            select_category: '-- Välj en kategori --',
            offline_got_position: 'Ange plats för rapportering',
            offline_failed_position: 'Position kunde inte hämtas.',
            required: 'nödvändigt',
            invalid_email: 'Ogiltig e-postadress',
            invalid_report: 'Ogiltig rapport',
            photo_failed: 'Ett problem uppstod då fotot togs.',
            photo_added: 'Foto tillagt',
            camera_access_denied: 'Vänligen tillåt tillgång till kameran i appens rättigheter.',
            photo_access_denied: 'Vänligen tillåt tillgång till foton i appens rättigheter.',
            photo_loading: 'Uppladdning av bilder kan ta en stund, vänligen vänta',
            upload_aborted: 'Ett problem uppstod då rapporten laddades upp.',
            try_again: 'Försök igen',
            save_for_later: 'Spara till senare',
            no_connection: 'Ingen nätverksanslutning finns tillgänglig för att skicka din rapport. Vänligen försök igen senare.',
            more_details: 'Fler detaljer',
            skip: 'Hoppa över',
            save: 'Spara'
        }
    });
})(FMS, _);
