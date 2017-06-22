(function (FMS, _) {
    _.extend( FMS, {
        validationStrings: {
            update: 'Por favor, introduzca un mensaje',
            title: 'Por favor, introduzca un título',
            detail: 'Por favor, escriba algunos detalles',
            name: {
                required: 'Por favor, introduzca su nombre',
                validName: 'Por favor, introduzca su nombre, los ayuntamientos necesitan esta información - si no quiere que su nombre se haga público en esta página web, borre la marca en la casilla de abajo'
            },
            category: 'Por favor, seleccione una categoría',
            rznvy: {
                required: 'Por favor, introduzca su email',
                email: 'Por favor, introduzca un email válido'
            },
            email: {
                required: 'Por favor, introduzca su email',
                email: 'Por favor, introduzca un email válido'
            },
            password: 'Por favor, introduzca la contraseña'
        },
        strings: {
            next: 'Siguiente',
            untitled_draft: 'Borrador sin título',
            login_error: 'Hubo un problema al abrir sesión. Por favor, inténtelo de nuevo más tarde.',
            logout_error: 'Hubo un problema al cerrar sesión. Por favor, inténtelo de nuevo más tarde.',
            login_details_error: 'Hubo un problema al abrir la sesión. Por favor, verifique su email y contraseña y que haya confirmado su contraseña.',
            password_problem: 'Hubo un problema con la combinación de su email/contraseña. Si ha olvidado su contraseña, o no tiene una, puede configurarla volviendo a la pantalla de email, y seleccionado la opción configuración de contraseña. Las contraseñas no se activan hasta que no se haga click sobre el enlace en el email de confirmación.',
            search_placeholder: 'Buscar un lugar o código postal',
            location_error: 'Error de ubicación',
            location_problem: 'Hubo un problema al buscar su ubicación.',
            multiple_locations: 'Más de una ubicación corresponde a ese nombre. Seleccione una abajo o pruebe indicando el nombre de la calle y área, o un código postal.',
            sync_error: 'Un error se ha generado al enviar su informe: ',
            unknown_sync_error: 'Hubo un problema al enviar su informe. Por favor, inténtelo de nuevo más tarde.',
            report_send_error: 'Hubo un problema al enviar su informe. Por favor, inténtelo de nuevo más tarde.',
            missing_location: 'Por favor, indique una ubicación',
            location_check_failed: 'Hubo un problema al verificar si cubrimos esta ubicación. Por favor, inténtelo de nuevo más tarde.',
            category_extra_check_error: 'Hubo un problema al verificar si tenemos todos los detalles que necesitamos. Por favor, inténtelo de nuevo más tarde.',
            locate_dismissed: 'Por favor, busque el nombre de la calle y área o código postal.',
            geolocation_failed: "Lo sentimos, no pudimos establecer su ubicación con la precisión necesaria para mostrarle un mapa. Por favor, como alternativa, incluya una ubicación en la casilla de búsqueda",
            geolocation_denied: 'No se pudo acceder a los servicios de ubicación. Por favor, verificar los permisos.',
            select_category: '-- Seleccione una categoría --',
            offline_got_position: 'Ubicación localizada.',
            offline_failed_position: 'No se pudo obtener la ubicación.',
            required: 'requerido(a)',
            invalid_email: 'Email inválido',
            invalid_report: 'Informe inválido',
            photo_failed: 'Hubo un problema al tomar su foto.',
            photo_added: 'Foto añadida',
            photo_loading: 'Subir imágenes podría demorar, por favor tenga paciencia',
            upload_aborted: 'Hubo un problema al subir su informe.',
            try_again: 'Inténtelo nuevamente',
            save_for_later: 'Guardar para más tarde',
            no_connection: 'No hay conexión a la red disponible para enviar su informe. Por favor, inténtelo de nuevo más tarde.',
            more_details: 'Más detalles'
        }
    });
})(FMS, _);
