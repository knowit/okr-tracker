<template>
  <div v-if="activeItem" class="form-wrapper form-card">
    <archived-restore v-if="activeItem.archived" :restore="restore" />

    <validation-observer v-slot="{ handleSubmit }">
      <form id="update-item" @submit.prevent="handleSubmit(update)">
        <form-component
          v-model="activeItem.name"
          input-type="input"
          name="name"
          :label="$t('fields.name')"
          rules="required"
          type="text"
          data-cy="org-name"
        />

        <label class="form-group">
          <span class="form-label">{{ $t('fields.slug') }}</span>
          <input v-model="activeItem.slug" class="form__field" type="text" disabled />
        </label>

        <form-component
          v-model="activeItem.missionStatement"
          input-type="textarea"
          name="missionStatement"
          :label="$t('fields.missionStatement')"
          rules="required"
        />

        <form-component
          v-model="activeItem.targetAudience"
          input-type="textarea"
          name="targetAudience"
          :label="$t('dashboard.targetAudience')"
        />

        <div v-if="type === 'department'" class="form-group">
          <span class="form-label">{{ $t('admin.department.parentOrganisation') }}</span>
          <v-select
            v-model="activeItem.organization"
            label="name"
            :options="organizations"
            :clearable="false"
          />
        </div>

        <div v-else-if="type === 'product'" class="form-group">
          <span class="form-label">{{ $t('admin.product.parentDepartment') }}</span>
          <v-select
            v-model="activeItem.department"
            label="name"
            :options="departments"
            :clearable="false"
          ></v-select>
        </div>

        <div class="form-group">
          <span class="form-label">{{ $t('general.teamMembers') }}</span>
          <v-select
            v-model="activeItem.team"
            multiple
            :options="users"
            :get-option-label="(option) => option.displayName || option.id"
          >
            <template #option="option">
              {{ option.displayName || option.id }}
              <span v-if="option.displayName !== option.id">({{ option.id }})</span>
            </template>
          </v-select>
        </div>

        <label class="form-group">
          <span class="form-label">{{ $t('fields.secret') }}</span>
          <span class="form-help" v-html="$t('admin.apiSecret')"></span>
          <input v-model="activeItem.secret" type="text" class="form__field" />
        </label>
      </form>
    </validation-observer>

    <div class="button-row">
      <btn-delete
        v-if="!activeItem.archived"
        :disabled="loading"
        @click="archive"
      />
      <btn-save form="update-item" :disabled="loading" />
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import Organization from '@/db/Organization';
import Department from '@/db/Department';
import Product from '@/db/Product';
import { db } from '@/config/firebaseConfig';
import { toastArchiveAndRevert } from '@/util';
import { BtnSave, BtnDelete } from '@/components/generic/form/buttons';

export default {
  name: 'ItemAdminGeneral',

  components: {
    ArchivedRestore: () => import('@/components/ArchivedRestore.vue'),
    BtnSave,
    BtnDelete,
  },

  data: () => ({
    loading: false,
  }),

  computed: {
    ...mapState(['activeItem', 'organizations', 'departments', 'users']),

    type() {
      const { department, organization } = this.activeItem;
      if (organization && department) return 'product';
      if (organization) return 'department';
      return 'organization';
    },
  },

  methods: {
    async update() {
      this.loading = true;
      try {
        const { id, name, missionStatement, targetAudience, secret } =
          this.activeItem;

        const team = this.activeItem.team.map((user) =>
          db.collection('users').doc(user.id)
        );

        const data = {
          id,
          name,
          team,
          missionStatement,
          targetAudience: targetAudience === undefined ? '' : targetAudience,
          secret: secret === undefined ? '' : secret,
        };

        if (this.type === 'organization') {
          await Organization.update(id, data);
        } else if (this.type === 'department') {
          const organization = await db
            .collection('organizations')
            .doc(this.activeItem.organization.id);

          await Department.update(id, {
            ...data,
            organization,
          });
        } else {
          const department = db
            .collection('departments')
            .doc(this.activeItem.department.id);

          await Product.update(id, {
            ...data,
            department,
          });
        }
        this.$toasted.show(this.$t('toaster.savedChanges'));
      } catch (error) {
        this.$toasted.error(this.$t('toaster.error.save'));
        throw new Error(error.message);
      } finally {
        this.loading = false;
      }
    },

    async archive() {
      this.loading = true;

      try {
        this.activeItem.archived = true;
        this.activeItem.slack = [];

        if (this.type === 'organization') {
          await Organization.archive(this.activeItem.id);
        } else if (this.type === 'department') {
          await Department.archive(this.activeItem.id);
        } else if (this.type === 'product') {
          await Product.archive(this.activeItem.id);
        }

        const restoreCallback = this.restore.bind(this);

        toastArchiveAndRevert({ name: this.activeItem.name, callback: restoreCallback });

        // TODO: Refresh store and sidebar navigation tree
      } catch (error) {
        this.$toasted.error(this.$t('toaster.error.archive', { document: this.activeItem.name }));
        this.activeItem.archived = false;
        throw new Error(error.message);
      } finally {
        this.loading = false;
      }
    },

    async restore() {
      this.loading = true;

      try {
        if (this.type === 'organization') {
          await Organization.restore(this.activeItem.id);
        } else if (this.type === 'department') {
          await Department.restore(this.activeItem.id);
        } else if (this.type === 'product') {
          await Product.restore(this.activeItem.id);
        }

        this.$toasted.show(this.$t('toaster.restored'));
        // TODO: Refresh store and sidebar navigation tree
      } catch (error) {
        this.$toasted.error(this.$t('toaster.error.restore', { document: this.activeItem.name }));
        throw new Error(error.message);
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>
