const Zap = {
    edit: data => {
        console.log('editIntegration', data)
        const {description, is_default, id, settings} = data
        zapVm.load({...settings, description, is_default, id})
        zapVm.modal.modal('show')
    },
    delete: id => {
        zapVm.load({id})
        zapVm.delete()
    },
    defaultTemplate: '',
    initialState: () => ({
        description: '',
        is_default: false,
        is_fetching: false,
        error: {},
        test_connection_status: 0,
        id: null,

        available_scan_types: ['xss', 'sqli'],
        scan_types: ['xss', 'sqli'],

        auth_login: 'user',
        auth_password: 'P@ssw0rd',
        auth_script: "- {command: open, target: '%Target%/login', value: ''}\n" +
            "- {command: waitForElementPresent, target: id=login_login, value: ''}\n" +
            "- {command: waitForElementPresent, target: id=login_password, value: ''}\n" +
            "- {command: waitForElementPresent, target: id=login_0, value: ''}\n" +
            "- {command: type, target: id=login_login, value: '%Username%'}\n" +
            "- {command: type, target: id=login_password, value: '%Password%'}\n" +
            "- {command: clickAndWait, target: id=login_0, value: ''}",
        // bind_all_interfaces: true,
        // daemon_debug: false,
        java_options: '-Xmx1g',
        // split_by_endpoint: false,
        passive_scan_wait_threshold: 0,
        passive_scan_wait_limit: 600,
        // external_zap_daemon: 'http://192.168.0.2:8091',
        // external_zap_api_key: 'dusty',
        // save_intermediates_to: '/data/intermediates/dast'


    }),
    pluginName: 'security_scanner_zap'
}


const zapApp = Vue.createApp({
    delimiters: ['[[', ']]'],
    data() {
        return {
            pluginName: Zap.pluginName,
            modal: $(`#${Zap.pluginName}_integration`),
            ...Zap.initialState()
        }
    },
    mounted() {
        this.modal.on('hidden.bs.modal', e => {
            this.clear()
        })
    },
    computed: {
        apiPath() {
            return `/api/v1/integrations/${this.pluginName}/`
        },
        project_id() {
            return getSelectedProjectId()
        },
        body_data() {
            const {
                description,
                is_default,
                project_id,

                scan_types,
                auth_login,
                auth_password,
                auth_script,
                bind_all_interfaces,
                daemon_debug,
                java_options,
                split_by_endpoint,
                passive_scan_wait_threshold,
                passive_scan_wait_limit,
                external_zap_daemon,
                external_zap_api_key,
                save_intermediates_to,
            } = this
            return {
                description,
                is_default,
                project_id,

                scan_types,
                auth_login,
                auth_password,
                auth_script,
                bind_all_interfaces,
                daemon_debug,
                java_options,
                split_by_endpoint,
                passive_scan_wait_threshold,
                passive_scan_wait_limit,
                external_zap_daemon,
                external_zap_api_key,
                save_intermediates_to,
            }
        },
        test_connection_class() {
            if (200 <= this.test_connection_status && this.test_connection_status < 300) {
                return 'btn-success'
            } else if (this.test_connection_status > 0) {
                return 'btn-warning'
            } else {
                return 'btn-secondary'
            }
        },
        scan_types_indeterminate() {
            return !(this.scan_types.length === 0 || this.scan_types.length === this.available_scan_types.length)
        }
    },
    watch: {
        is_fetching(newState, oldState) {
            if (newState) {
                this.test_connection_status = 0
            }
        },
    },
    methods: {
        handle_select_all(e) {
            if (this.scan_types_indeterminate || !e.target.checked) {
                this.scan_types = []
                e.target.checked = false
            } else {
                this.scan_types = [...this.available_scan_types]
            }
        },
        // test_connection() {
        //     this.is_fetching = true
        //     fetch(this.apiPath + 'check_settings', {
        //         method: 'POST',
        //         headers: {'Content-Type': 'application/json'},
        //         body: JSON.stringify(this.body_data)
        //     }).then(response => {
        //         console.log(response)
        //         this.is_fetching = false
        //         this.test_connection_status = response.status
        //         if (!response.ok) {
        //             this.handleError(response)
        //         }
        //     })
        // },
        clear() {
            Object.assign(this.$data, {
                ...this.$data,
                ...Zap.initialState(),
            })
        },
        load(stateData) {
            Object.assign(this.$data, {
                ...this.$data,
                ...stateData
            })
        },
        create() {
            this.is_fetching = true
            fetch(this.apiPath, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(this.body_data)
            }).then(response => {
                this.is_fetching = false
                if (response.ok) {
                    this.modal.modal('hide')
                    location.reload()
                } else {
                    this.handleError(response)
                }
            })
        },
        handleError(response) {
            try {
                response.json().then(
                    errorData => {
                        console.log(errorData)
                        errorData.forEach(item => {
                            console.log('item error', item)
                            this.error = {[item.loc[0]]: item.msg}
                        })
                    }
                )
            } catch (e) {
                alertMain.add(e, 'danger-overlay')
            }
        },
        update() {
            this.is_fetching = true
            fetch(this.apiPath + this.id, {
                method: 'PUT',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(this.body_data)
            }).then(response => {
                this.is_fetching = false
                if (response.ok) {
                    this.modal.modal('hide')
                    location.reload()
                } else {
                    this.handleError(response)
                }
            })
        },
        delete() {
            this.is_fetching = true
            fetch(this.apiPath + this.id, {
                method: 'DELETE',
            }).then(response => {
                this.is_fetching = false
                if (response.ok) {
                    location.reload()
                } else {
                    this.handleError(response)
                    alertMain.add(`Deletion error. <button class="btn btn-primary" @click="modal.modal('show')">Open modal<button>`)
                }
            })
        },
        handleScanTypeCheck(value, checked) {
            if (checked) {
                this.scan_types.push(value)
            } else {
                const i = this.scan_types.indexOf(value)
                this.scan_types.splice(i, 1)
            }
        }
    }
})

zapApp.config.compilerOptions.isCustomElement = tag => ['h9', 'h13'].includes(tag)
const zapVm = zapApp.mount(`#${Zap.pluginName}_integration`)
